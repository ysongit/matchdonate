// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/IGivingFundToken.sol";

/**
 * @title BespokeFundToken
 * @dev Individual giving fund token backed 1:1 by GF tokens
 */
contract BespokeFundToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 6;
    uint256 public totalSupply;

    address public immutable owner; // The individual who created this fund
    address public immutable gfToken; // Giving Fund Token address
    address public immutable factory; // Factory contract address
    bool private initialized; // Prevent multiple initial mints

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed user, uint256 amount);
    event Redeemed(address indexed redeemer, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    constructor(string memory _name, string memory _symbol, address _owner, address _gfToken) {
        name = _name;
        symbol = _symbol;
        owner = _owner;
        gfToken = _gfToken;
        factory = msg.sender;
    }

    /**
     * @dev Initial mint called only once by factory during fund creation
     * @param to Address to mint tokens to (fund owner)
     * @param amount Amount to mint
     */
    function initialMint(address to, uint256 amount) external onlyFactory {
        require(!initialized, "Already initialized");
        require(amount > 0, "Amount must be > 0");

        initialized = true;
        totalSupply = amount;
        balanceOf[to] = amount;

        emit Minted(to, amount);
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Mint bespoke tokens by burning user's GF tokens and minting to fund
     * @param amount Amount of GF tokens to burn and bespoke tokens to mint
     */
    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        // Burn GF tokens from user
        require(IGivingFundToken(gfToken).burn(msg.sender, amount), "GF burn failed");

        // Mint GF tokens to this contract to back the bespoke tokens
        require(IGivingFundToken(gfToken).mintTo(address(this), amount), "GF mint failed");

        // Mint bespoke tokens to user
        totalSupply += amount;
        balanceOf[msg.sender] += amount;

        emit Minted(msg.sender, amount);
        emit Transfer(address(0), msg.sender, amount);
    }

    /**
     * @dev Redeem bespoke tokens for GF tokens
     * Can only be called by approved nonprofits or the fund owner
     * @param amount Amount to redeem
     */
    function redeem(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(
            IGivingFundToken(gfToken).isApprovedNonprofit(msg.sender) || msg.sender == owner,
            "Only approved nonprofits or owner"
        );
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        // Burn bespoke tokens
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        // Burn GF tokens from this contract
        require(IGivingFundToken(gfToken).burn(address(this), amount), "GF burn failed");

        // Mint GF tokens to redeemer
        require(IGivingFundToken(gfToken).mintTo(msg.sender, amount), "GF mint failed");

        emit Redeemed(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    /**
     * @dev Transfer tokens
     */
    function transfer(address to, uint256 amount) public returns (bool) {
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
    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Approve to zero address");

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer from
     */
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
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
     * @dev Get GF token balance held by this contract
     */
    function gfTokenReserve() external view returns (uint256) {
        return IGivingFundToken(gfToken).balanceOf(address(this));
    }
}
