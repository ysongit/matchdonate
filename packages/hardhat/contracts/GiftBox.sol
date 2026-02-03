// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/IERC20.sol";

/**
 * @title GiftBox
 * @dev Contract for sending Bespoke Fund Tokens or Matching Fund Tokens as gifts via redeem codes
 * Sender deposits tokens and generates a code, recipient uses code to claim tokens
 */
contract GiftBox {
    address public admin;
    bool public paused;
    
    uint256 public nextGiftId;
    
    struct Gift {
        uint256 giftId;
        address sender;
        address tokenAddress; // Address of the Bespoke or Matching Fund Token
        uint256 amount;
        bytes32 redeemCodeHash; // Hash of the redeem code
        bool claimed;
        address claimedBy;
        uint256 createdAt;
        uint256 claimedAt;
        string tokenName;
        uint8 tokenType;
    }
    
    mapping(uint256 => Gift) public gifts;
    mapping(bytes32 => uint256) public codeToGiftId; // Maps redeem code hash to gift ID
    mapping(address => uint256[]) public senderGifts; // Track gifts sent by each address
    mapping(address => uint256[]) public recipientGifts; // Track gifts claimed by each address
    
    event GiftCreated(
        uint256 indexed giftId,
        address indexed sender,
        address indexed tokenAddress,
        uint256 amount,
        uint8 tokenType,
        uint256 timestamp
    );
    
    event GiftClaimed(
        uint256 indexed giftId,
        address indexed recipient,
        address indexed tokenAddress,
        uint256 amount,
        uint256 timestamp
    );
    
    event GiftCancelled(
        uint256 indexed giftId,
        address indexed sender,
        uint256 amount,
        uint256 timestamp
    );
    
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        nextGiftId = 1;
    }
    
    /**
     * @dev Create a gift with a redeem code
     * @param tokenAddress Address of the Bespoke or Matching Fund Token
     * @param amount Amount of tokens to gift
     * @param redeemCode Secret code that recipient will use (should be generated off-chain)
     * @param tokenType 1 for Bespoke Fund Token, 2 for Matching Fund Token
     */
    function createGift(
        address tokenAddress,
        uint256 amount,
        string memory redeemCode,
        uint8 tokenType
    ) external whenNotPaused returns (uint256) {
        require(tokenAddress != address(0), "Invalid token address");
        require(amount > 0, "Amount must be > 0");
        require(bytes(redeemCode).length > 0, "Redeem code required");
        
        bytes32 codeHash = keccak256(abi.encodePacked(redeemCode));
        require(codeToGiftId[codeHash] == 0, "Code already used");
        
        // Transfer tokens from sender to this contract
        require(
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        uint256 giftId = nextGiftId++;

        IERC20 token = IERC20(tokenAddress);
        
        gifts[giftId] = Gift({
            giftId: giftId,
            sender: msg.sender,
            tokenAddress: tokenAddress,
            amount: amount,
            redeemCodeHash: codeHash,
            claimed: false,
            claimedBy: address(0),
            createdAt: block.timestamp,
            claimedAt: 0,
            tokenName: token.name(),
            tokenType: tokenType
        });
        
        codeToGiftId[codeHash] = giftId;
        senderGifts[msg.sender].push(giftId);
        
        emit GiftCreated(giftId, msg.sender, tokenAddress, amount, tokenType, block.timestamp);
        
        return giftId;
    }
    
    /**
     * @dev Claim a gift using the redeem code
     * @param redeemCode The secret code provided by the sender
     */
    function claimGift(string memory redeemCode) external whenNotPaused returns (uint256) {
        bytes32 codeHash = keccak256(abi.encodePacked(redeemCode));
        uint256 giftId = codeToGiftId[codeHash];
        
        require(giftId != 0, "Invalid redeem code");
        
        Gift storage gift = gifts[giftId];
        require(!gift.claimed, "Gift already claimed");
        
        // Mark as claimed
        gift.claimed = true;
        gift.claimedBy = msg.sender;
        gift.claimedAt = block.timestamp;
        
        recipientGifts[msg.sender].push(giftId);
        
        // Transfer tokens to recipient
        require(
            IERC20(gift.tokenAddress).transfer(msg.sender, gift.amount),
            "Token transfer failed"
        );
        
        emit GiftClaimed(giftId, msg.sender, gift.tokenAddress, gift.amount, block.timestamp);
        
        return giftId;
    }
    
    /**
     * @dev Cancel an unclaimed gift and return tokens to sender
     * @param giftId ID of the gift to cancel
     */
    function cancelGift(uint256 giftId) external whenNotPaused {
        Gift storage gift = gifts[giftId];
        
        require(gift.giftId != 0, "Gift does not exist");
        require(gift.sender == msg.sender, "Only sender can cancel");
        require(!gift.claimed, "Gift already claimed");
        
        // Mark as claimed to prevent re-cancellation
        gift.claimed = true;
        gift.claimedBy = msg.sender; // Return to sender
        gift.claimedAt = block.timestamp;
        
        // Return tokens to sender
        require(
            IERC20(gift.tokenAddress).transfer(msg.sender, gift.amount),
            "Token transfer failed"
        );
        
        emit GiftCancelled(giftId, msg.sender, gift.amount, block.timestamp);
    }
    
    /**
     * @dev Get gift details by ID
     * @param giftId Gift ID
     */
    function getGift(uint256 giftId) external view returns (
        address sender,
        address tokenAddress,
        uint256 amount,
        bool claimed,
        address claimedBy,
        uint256 createdAt,
        uint256 claimedAt,
        string memory tokenName
    ) {
        Gift memory gift = gifts[giftId];
        require(gift.giftId != 0, "Gift does not exist");
        
        return (
            gift.sender,
            gift.tokenAddress,
            gift.amount,
            gift.claimed,
            gift.claimedBy,
            gift.createdAt,
            gift.claimedAt,
            gift.tokenName
        );
    }
    
    /**
     * @dev Check if a redeem code is valid and unclaimed
     * @param redeemCode The code to check
     */
    function isCodeValid(string memory redeemCode) external view returns (bool valid, uint256 giftId) {
        bytes32 codeHash = keccak256(abi.encodePacked(redeemCode));
        giftId = codeToGiftId[codeHash];
        
        if (giftId == 0) {
            return (false, 0);
        }
        
        Gift memory gift = gifts[giftId];
        valid = !gift.claimed;
        
        return (valid, giftId);
    }
    
    /**
     * @dev Get all gifts sent by a user
     * @param sender Sender address
     */
    function getSentGifts(address sender) external view returns (uint256[] memory) {
        return senderGifts[sender];
    }
    
    /**
     * @dev Get all gifts claimed by a user
     * @param recipient Recipient address
     */
    function getClaimedGifts(address recipient) external view returns (uint256[] memory) {
        return recipientGifts[recipient];
    }
    
    /**
     * @dev Get count of gifts sent by a user
     * @param sender Sender address
     */
    function getSentGiftCount(address sender) external view returns (uint256) {
        return senderGifts[sender].length;
    }
    
    /**
     * @dev Get count of gifts claimed by a user
     * @param recipient Recipient address
     */
    function getClaimedGiftCount(address recipient) external view returns (uint256) {
        return recipientGifts[recipient].length;
    }
    
    /**
     * @dev Get unclaimed gifts sent by a user
     * @param sender Sender address
     */
    function getUnclaimedSentGifts(address sender) external view returns (uint256[] memory) {
        uint256[] memory sentGiftIds = senderGifts[sender];
        uint256 unclaimedCount = 0;
        
        // Count unclaimed gifts
        for (uint i = 0; i < sentGiftIds.length; i++) {
            if (!gifts[sentGiftIds[i]].claimed) {
                unclaimedCount++;
            }
        }
        
        // Build unclaimed gifts array
        uint256[] memory unclaimedGifts = new uint256[](unclaimedCount);
        uint256 currentIndex = 0;
        
        for (uint i = 0; i < sentGiftIds.length; i++) {
            if (!gifts[sentGiftIds[i]].claimed) {
                unclaimedGifts[currentIndex] = sentGiftIds[i];
                currentIndex++;
            }
        }
        
        return unclaimedGifts;
    }
    
    /**
     * @dev Get multiple gift details at once
     * @param giftIds Array of gift IDs to retrieve
     */
    function getGiftsBatch(uint256[] memory giftIds) external view returns (
        address[] memory senders,
        address[] memory tokenAddresses,
        uint256[] memory amounts,
        bool[] memory claimed,
        address[] memory claimedBy,
        string[] memory tokenNames
    ) {
        uint256 count = giftIds.length;
        
        senders = new address[](count);
        tokenAddresses = new address[](count);
        amounts = new uint256[](count);
        claimed = new bool[](count);
        claimedBy = new address[](count);
        tokenNames = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            Gift memory gift = gifts[giftIds[i]];
            
            senders[i] = gift.sender;
            tokenAddresses[i] = gift.tokenAddress;
            amounts[i] = gift.amount;
            claimed[i] = gift.claimed;
            claimedBy[i] = gift.claimedBy;
            tokenNames[i] = gift.tokenName;
        }
        
        return (senders, tokenAddresses, amounts, claimed, claimedBy, tokenNames);
    }
    
    /**
     * @dev Get total number of gifts created
     */
    function getTotalGifts() external view returns (uint256) {
        return nextGiftId - 1;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyAdmin {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyAdmin {
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @dev Transfer admin rights
     * @param newAdmin New admin address
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(oldAdmin, newAdmin);
    }
}