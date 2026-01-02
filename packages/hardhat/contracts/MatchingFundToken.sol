// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGivingFundToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title MatchingFundToken
 * @dev Matching fund token with expiration date - backed 1:1 by GF tokens
 * After expiration, nonprofits cannot redeem, and owner can reclaim GF tokens
 */
contract MatchingFundToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 6;
    uint256 public totalSupply;

    address public immutable owner; // The individual who created this fund
    address public immutable gfToken; // Giving Fund Token address
    address public immutable factory; // Factory contract address
    uint256 public expirationDate; // Unix timestamp when fund expires
    
    mapping(address => bool) public approvedNonprofits;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed user, uint256 amount);
    event Redeemed(address indexed redeemer, uint256 amount);
    event NonprofitApproved(address indexed nonprofit);
    event NonprofitRemoved(address indexed nonprofit);
    event ExpirationExtended(uint256 oldExpiration, uint256 newExpiration);
    event FundsReclaimed(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier whenFactoryNotPaused() {
        require(!MatchingFundTokenFactory(factory).paused(), "Factory paused");
        _;
    }

    modifier beforeExpiration() {
        require(block.timestamp < expirationDate, "Fund has expired");
        _;
    }

    modifier afterExpiration() {
        require(block.timestamp >= expirationDate, "Fund has not expired yet");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _owner,
        address _gfToken,
        uint256 _expirationDate,
        address[] memory _nonprofits
    ) {
        require(_expirationDate > block.timestamp, "Expiration must be in future");
        
        name = _name;
        symbol = _symbol;
        owner = _owner;
        gfToken = _gfToken;
        factory = msg.sender;
        expirationDate = _expirationDate;

        // Approve initial nonprofits
        for (uint i = 0; i < _nonprofits.length; i++) {
            approvedNonprofits[_nonprofits[i]] = true;
            emit NonprofitApproved(_nonprofits[i]);
        }
    }

    /**
     * @dev Mint matching fund tokens by depositing GF tokens (1:1)
     * @param amount Amount of GF tokens to deposit
     */
    function mint(uint256 amount) external whenFactoryNotPaused {
        require(amount > 0, "Amount must be > 0");

        // Transfer GF tokens from user to this contract
        require(
            IGivingFundToken(gfToken).transferFrom(msg.sender, address(this), amount),
            "GF transfer failed"
        );

        // Mint matching fund tokens
        totalSupply += amount;
        balanceOf[msg.sender] += amount;

        emit Minted(msg.sender, amount);
        emit Transfer(address(0), msg.sender, amount);
    }

    /**
     * @dev Redeem matching fund tokens for GF tokens
     * Can only be called by approved nonprofits or the fund owner
     * Can only be called BEFORE expiration date
     * @param amount Amount to redeem
     */
    function redeem(uint256 amount) external whenFactoryNotPaused beforeExpiration {
        require(amount > 0, "Amount must be > 0");
        require(
            approvedNonprofits[msg.sender] || msg.sender == owner,
            "Only approved nonprofits or owner"
        );
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        // Burn matching fund tokens
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        // Transfer GF tokens to redeemer
        require(
            IGivingFundToken(gfToken).transfer(msg.sender, amount),
            "GF transfer failed"
        );

        emit Redeemed(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    /**
     * @dev Owner can reclaim unused GF tokens after expiration
     * This allows owner to recover funds that nonprofits didn't claim in time
     */
    function reclaimExpiredFunds() external onlyOwner afterExpiration {
        uint256 gfBalance = IGivingFundToken(gfToken).balanceOf(address(this));
        require(gfBalance > 0, "No funds to reclaim");

        // Transfer all remaining GF tokens back to owner
        require(
            IGivingFundToken(gfToken).transfer(owner, gfBalance),
            "GF transfer failed"
        );

        emit FundsReclaimed(owner, gfBalance);
    }

    /**
     * @dev Extend the expiration date
     * Only owner can extend, and can only extend to a future date
     * @param newExpirationDate New expiration timestamp
     */
    function extendExpiration(uint256 newExpirationDate) external onlyOwner {
        require(newExpirationDate > expirationDate, "New expiration must be later");
        require(newExpirationDate > block.timestamp, "New expiration must be in future");

        uint256 oldExpiration = expirationDate;
        expirationDate = newExpirationDate;

        emit ExpirationExtended(oldExpiration, newExpirationDate);
    }

    /**
     * @dev Add nonprofit to approved list
     * @param nonprofit Address to approve
     */
    function approveNonprofit(address nonprofit) external onlyOwner {
        require(nonprofit != address(0), "Invalid address");
        require(!approvedNonprofits[nonprofit], "Already approved");
        
        approvedNonprofits[nonprofit] = true;
        emit NonprofitApproved(nonprofit);
    }

    /**
     * @dev Remove nonprofit from approved list
     * @param nonprofit Address to remove
     */
    function removeNonprofit(address nonprofit) external onlyOwner {
        require(approvedNonprofits[nonprofit], "Not approved");
        
        approvedNonprofits[nonprofit] = false;
        emit NonprofitRemoved(nonprofit);
    }

    /**
     * @dev Transfer tokens
     */
    function transfer(address to, uint256 amount) public whenFactoryNotPaused returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Approve spender
     */
    function approve(address spender, uint256 amount) public whenFactoryNotPaused returns (bool) {
        require(spender != address(0), "Approve to zero address");

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer from
     */
    function transferFrom(address from, address to, uint256 amount) public whenFactoryNotPaused returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Check if fund has expired
     */
    function hasExpired() external view returns (bool) {
        return block.timestamp >= expirationDate;
    }

    /**
     * @dev Get time remaining until expiration (0 if expired)
     */
    function timeUntilExpiration() external view returns (uint256) {
        if (block.timestamp >= expirationDate) {
            return 0;
        }
        return expirationDate - block.timestamp;
    }

    /**
     * @dev Get GF token balance held by this contract
     */
    function gfTokenReserve() external view returns (uint256) {
        return IGivingFundToken(gfToken).balanceOf(address(this));
    }
}
