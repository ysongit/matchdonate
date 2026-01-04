// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MatchingFundToken.sol";

/**
 * @title MatchingFundTokenFactory
 * @dev Factory contract for creating and tracking matching fund tokens with expiration
 */
contract MatchingFundTokenFactory {
    address public admin;
    address public immutable gfToken;
    bool public paused;

    // Tracking structures
    mapping(address => address[]) public userFunds; // user => array of their created funds
    address[] public allFunds; // all funds ever created
    mapping(address => bool) public isFund; // quick lookup if address is a fund
    mapping(address => FundInfo) public fundInfo; // detailed info about each fund

    struct FundInfo {
        address fundAddress;
        address creator;
        string name;
        string symbol;
        uint256 expirationDate;
        uint256 createdAt;
        bool exists;
    }

    event FundCreated(
        address indexed creator,
        address indexed fundAddress,
        string name,
        string symbol,
        uint256 expirationDate,
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

    constructor(address _gfToken) {
        require(_gfToken != address(0), "Invalid GF token address");
        admin = msg.sender;
        gfToken = _gfToken;
    }

    /**
     * @dev Create a new matching fund token with expiration
     * @param name Token name (e.g., "Bob's Matching Campaign 2024")
     * @param symbol Token symbol (e.g., "BMC24")
     * @param expirationDate Unix timestamp when fund expires
     */
    function createFund(
        string memory name,
        string memory symbol,
        uint256 expirationDate
    ) external whenNotPaused returns (address) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(expirationDate > block.timestamp, "Expiration must be in future");

        // Deploy new matching fund token
        MatchingFundToken newFund = new MatchingFundToken(
            name,
            symbol,
            msg.sender,
            gfToken,
            expirationDate
        );

        address fundAddress = address(newFund);

        // Track the fund
        userFunds[msg.sender].push(fundAddress);
        allFunds.push(fundAddress);
        isFund[fundAddress] = true;
        
        fundInfo[fundAddress] = FundInfo({
            fundAddress: fundAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            expirationDate: expirationDate,
            createdAt: block.timestamp,
            exists: true
        });

        emit FundCreated(msg.sender, fundAddress, name, symbol, expirationDate, block.timestamp);

        return fundAddress;
    }

    /**
     * @dev Get all funds created by a user
     * @param user User address
     */
    function getUserFunds(address user) external view returns (address[] memory) {
        return userFunds[user];
    }

    /**
     * @dev Get number of funds created by a user
     * @param user User address
     */
    function getUserFundCount(address user) external view returns (uint256) {
        return userFunds[user].length;
    }

    /**
     * @dev Get all funds ever created
     */
    function getAllFunds() external view returns (address[] memory) {
        return allFunds;
    }

    /**
     * @dev Get total number of funds created
     */
    function getTotalFunds() external view returns (uint256) {
        return allFunds.length;
    }

    /**
     * @dev Get fund address by index
     * @param index Index in allFunds array
     */
    function getFundByIndex(uint256 index) external view returns (address) {
        require(index < allFunds.length, "Index out of bounds");
        return allFunds[index];
    }

    /**
     * @dev Get detailed info about a fund
     * @param fundAddress Address of the fund
     */
    function getFundInfo(address fundAddress) external view returns (
        address creator,
        string memory name,
        string memory symbol,
        uint256 expirationDate,
        uint256 createdAt,
        bool exists
    ) {
        FundInfo memory info = fundInfo[fundAddress];
        return (info.creator, info.name, info.symbol, info.expirationDate, info.createdAt, info.exists);
    }

    /**
     * @dev Check if an address is a fund created by this factory
     * @param fundAddress Address to check
     */
    function isValidFund(address fundAddress) external view returns (bool) {
        return isFund[fundAddress];
    }

    /**
     * @dev Get active (non-expired) funds for a user
     * @param user User address
     */
    function getActiveFunds(address user) external view returns (address[] memory) {
        address[] memory userFundsList = userFunds[user];
        uint256 activeCount = 0;
        
        // Count active funds
        for (uint i = 0; i < userFundsList.length; i++) {
            if (block.timestamp < fundInfo[userFundsList[i]].expirationDate) {
                activeCount++;
            }
        }
        
        // Build active funds array
        address[] memory activeFunds = new address[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint i = 0; i < userFundsList.length; i++) {
            if (block.timestamp < fundInfo[userFundsList[i]].expirationDate) {
                activeFunds[currentIndex] = userFundsList[i];
                currentIndex++;
            }
        }
        
        return activeFunds;
    }

    /**
     * @dev Get expired funds for a user
     * @param user User address
     */
    function getExpiredFunds(address user) external view returns (address[] memory) {
        address[] memory userFundsList = userFunds[user];
        uint256 expiredCount = 0;
        
        // Count expired funds
        for (uint i = 0; i < userFundsList.length; i++) {
            if (block.timestamp >= fundInfo[userFundsList[i]].expirationDate) {
                expiredCount++;
            }
        }
        
        // Build expired funds array
        address[] memory expiredFunds = new address[](expiredCount);
        uint256 currentIndex = 0;
        
        for (uint i = 0; i < userFundsList.length; i++) {
            if (block.timestamp >= fundInfo[userFundsList[i]].expirationDate) {
                expiredFunds[currentIndex] = userFundsList[i];
                currentIndex++;
            }
        }
        
        return expiredFunds;
    }

    /**
     * @dev Get multiple fund details at once
     * @param startIndex Starting index
     * @param count Number of funds to retrieve
     */
    function getFundsBatch(uint256 startIndex, uint256 count) external view returns (
        address[] memory fundAddresses,
        address[] memory creators,
        string[] memory names,
        string[] memory symbols,
        uint256[] memory expirationDates,
        bool[] memory hasExpired
    ) {
        require(startIndex < allFunds.length, "Start index out of bounds");
        
        uint256 endIndex = startIndex + count;
        if (endIndex > allFunds.length) {
            endIndex = allFunds.length;
        }
        
        uint256 actualCount = endIndex - startIndex;
        
        fundAddresses = new address[](actualCount);
        creators = new address[](actualCount);
        names = new string[](actualCount);
        symbols = new string[](actualCount);
        expirationDates = new uint256[](actualCount);
        hasExpired = new bool[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            address fundAddr = allFunds[startIndex + i];
            FundInfo memory info = fundInfo[fundAddr];
            
            fundAddresses[i] = fundAddr;
            creators[i] = info.creator;
            names[i] = info.name;
            symbols[i] = info.symbol;
            expirationDates[i] = info.expirationDate;
            hasExpired[i] = block.timestamp >= info.expirationDate;
        }
        
        return (fundAddresses, creators, names, symbols, expirationDates, hasExpired);
    }

    /**
     * @dev Pause the factory
     */
    function pause() external onlyAdmin {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Unpause the factory
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
