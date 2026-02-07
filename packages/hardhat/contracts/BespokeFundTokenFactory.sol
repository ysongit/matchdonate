// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BespokeFundToken.sol";
import "./interface/IGivingFundToken.sol";

/**
 * @title BespokeFundTokenFactory
 * @dev Factory contract for creating and tracking individual giving fund tokens
 */
contract BespokeFundTokenFactory {
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
        uint256 createdAt;
        bool exists;
    }

    event FundCreated(
        address indexed creator,
        address indexed fundAddress,
        string name,
        string symbol,
        uint256 initialAmount,
        uint256 fundAmount,
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
     * @dev Create a new bespoke fund token with initial mint
     * @param name Token name (e.g., "Alice's Education Fund")
     * @param symbol Token symbol (e.g., "ALEF")
     * @param initialAmount Amount of bespoke tokens to mint to creator
     * @param fundAmount Amount of GF tokens to burn from creator and mint to bespoke fund
     */
    function createFund(
        string memory name,
        string memory symbol,
        uint256 initialAmount,
        uint256 fundAmount
    ) external whenNotPaused returns (address) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(initialAmount > 0, "Initial amount must be > 0");
        require(fundAmount <= IGivingFundToken(gfToken).balanceOf(msg.sender), "Not enough GF tokens");

        // Burn GF tokens from the creator
        require(IGivingFundToken(gfToken).burn(msg.sender, fundAmount), "GF burn failed");

        // Deploy new bespoke fund token
        BespokeFundToken newFund = new BespokeFundToken(name, symbol, msg.sender, gfToken);

        address fundAddress = address(newFund);

        // Mint GF tokens to the new fund contract to back the bespoke tokens
        require(IGivingFundToken(gfToken).mintTo(fundAddress, fundAmount), "GF mint failed");

        // Mint initial bespoke tokens to the creator
        newFund.initialMint(msg.sender, initialAmount);

        // Track the fund
        userFunds[msg.sender].push(fundAddress);
        allFunds.push(fundAddress);
        isFund[fundAddress] = true;

        fundInfo[fundAddress] = FundInfo({
            fundAddress: fundAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            createdAt: block.timestamp,
            exists: true
        });

        emit FundCreated(msg.sender, fundAddress, name, symbol, initialAmount, fundAmount, block.timestamp);

        return fundAddress;
    }

    /**
     * @dev Increase funding by burning user's GF tokens
     * This is specifically for contributing to someone else's fund
     * @param amount Amount of GF tokens to burn and contribute
     */
    function increaseFunding(uint256 amount, address bespokeTokenAddress) external {
        require(amount > 0, "Amount must be > 0");
        require(amount <= IGivingFundToken(gfToken).balanceOf(msg.sender), "Not enough GF tokens");

        // Burn GF tokens from contributor
        require(IGivingFundToken(gfToken).burn(msg.sender, amount), "GF burn failed");

        // Mint GF tokens to this contract to back the bespoke tokens
        require(IGivingFundToken(gfToken).mintTo(bespokeTokenAddress, amount), "GF mint failed");
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
    function getFundInfo(
        address fundAddress
    )
        external
        view
        returns (address creator, string memory name, string memory symbol, uint256 createdAt, bool exists)
    {
        FundInfo memory info = fundInfo[fundAddress];
        return (info.creator, info.name, info.symbol, info.createdAt, info.exists);
    }

    /**
     * @dev Check if an address is a fund created by this factory
     * @param fundAddress Address to check
     */
    function isValidFund(address fundAddress) external view returns (bool) {
        return isFund[fundAddress];
    }

    /**
     * @dev Get multiple fund details at once
     * @param startIndex Starting index
     * @param count Number of funds to retrieve
     */
    function getFundsBatch(
        uint256 startIndex,
        uint256 count
    )
        external
        view
        returns (
            address[] memory fundAddresses,
            address[] memory creators,
            string[] memory names,
            string[] memory symbols
        )
    {
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

        for (uint256 i = 0; i < actualCount; i++) {
            address fundAddr = allFunds[startIndex + i];
            FundInfo memory info = fundInfo[fundAddr];

            fundAddresses[i] = fundAddr;
            creators[i] = info.creator;
            names[i] = info.name;
            symbols[i] = info.symbol;
        }

        return (fundAddresses, creators, names, symbols);
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
