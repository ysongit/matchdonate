// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/IERC20.sol";

/**
 * @title GivingFundToken
 * @dev ERC20 token backed 1:1 by USDC for charitable giving
 * Users can mint GF tokens by depositing USDC
 * Only owner can burn tokens and send USDC to recipients
 */
contract GivingFundToken {
    string public name = "Giving Fund Token";
    string public symbol = "GFT";
    uint8 public decimals = 6; // Match USDC decimals
    uint256 public totalSupply;

    address public owner;
    address public immutable usdcToken;
    bool public paused;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public approvedNonprofits;
    mapping(address => bool) public authorizedMinters; // Contracts authorized to mint/burn

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed user, uint256 amount, uint256 date);
    event Burned(address indexed recipient, uint256 amount);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event NonprofitApproved(address indexed nonprofit);
    event NonprofitRevoked(address indexed nonprofit);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /**
     * @dev Constructor sets the USDC token address and owner
     * @param _usdcToken Address of the USDC token contract
     */
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC address");
        owner = msg.sender;
        usdcToken = _usdcToken;
    }

    /**
     * @dev Exchange USDC for Giving Fund Tokens at 1:1 ratio
     * @param amount Amount of USDC to deposit (in USDC's smallest unit)
     */
    function mint(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");

        // Transfer USDC from user to owner
        require(
            IERC20(usdcToken).transferFrom(msg.sender, owner, amount),
            "USDC transfer failed"
        );

        // Mint GF tokens to user
        totalSupply += amount;
        balanceOf[msg.sender] += amount;

        emit Minted(msg.sender, amount, block.timestamp);
        emit Transfer(address(0), msg.sender, amount);
    }

    /**
     * @dev Mint tokens to a specific address - only authorized contracts
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mintTo(address to, uint256 amount) external onlyAuthorized returns (bool) {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");

        totalSupply += amount;
        balanceOf[to] += amount;

        emit Minted(to, amount, block.timestamp);
        emit Transfer(address(0), to, amount);
        return true;
    }

    /**
     * @dev Burn tokens from sender's balance - can be called by authorized contracts
     * @param sender Address to burn from
     * @param amount Amount to burn
     */
    function burn(address sender, uint256 amount) public onlyAuthorized returns (bool) {
        require(balanceOf[sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");

        balanceOf[sender] -= amount;
        totalSupply -= amount;

        emit Transfer(sender, address(0), amount);
        return true;
    }

    /**
     * @dev Owner burns GF tokens and sends USDC to recipient
     * @param recipient Address to send USDC to
     * @param amount Amount of tokens to burn and USDC to send
     */
    function burnAndSendUSDC(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Cannot send to zero address");
        require(balanceOf[recipient] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");

        // Burn GF tokens
        balanceOf[recipient] -= amount;
        totalSupply -= amount;

        // Send USDC to recipient
        require(
            IERC20(usdcToken).transferFrom(owner, recipient, amount),
            "USDC transfer failed"
        );

        emit Burned(recipient, amount);
        emit Transfer(recipient, address(0), amount);
    }

    /**
     * @dev Transfer tokens to another address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 amount) public whenNotPaused returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Approve spender to spend tokens on behalf of owner
     * @param spender Address authorized to spend
     * @param amount Amount authorized to spend
     */
    function approve(address spender, uint256 amount) public whenNotPaused returns (bool) {
        require(spender != address(0), "Approve to zero address");

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another using allowance
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Amount to transfer
     */
    function transferFrom(address from, address to, uint256 amount) public whenNotPaused returns (bool) {
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
     * @dev Authorize a contract to mint and burn tokens
     * @param minter Address to authorize
     */
    function authorizeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Cannot authorize zero address");
        require(!authorizedMinters[minter], "Already authorized");
        
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }

    /**
     * @dev Revoke minter authorization
     * @param minter Address to revoke
     */
    function revokeMinter(address minter) external onlyOwner {
        require(authorizedMinters[minter], "Not authorized");
        
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }

    /**
     * @dev Check if address is authorized minter
     * @param minter Address to check
     */
    function isAuthorizedMinter(address minter) external view returns (bool) {
        return authorizedMinters[minter];
    }

    /**
     * @dev Pause the contract - only owner can call
     */
    function pause() external onlyOwner {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Unpause the contract - only owner can call
     */
    function unpause() external onlyOwner {
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @dev Transfer ownership to a new address
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev Approve a nonprofit address
     * @param nonprofit Address of nonprofit to approve
     */
    function approveNonprofit(address nonprofit) external onlyOwner {
        require(nonprofit != address(0), "Cannot approve zero address");
        require(!approvedNonprofits[nonprofit], "Nonprofit already approved");
        
        approvedNonprofits[nonprofit] = true;
        emit NonprofitApproved(nonprofit);
    }

    /**
     * @dev Revoke a nonprofit address
     * @param nonprofit Address of nonprofit to revoke
     */
    function revokeNonprofit(address nonprofit) external onlyOwner {
        require(approvedNonprofits[nonprofit], "Nonprofit not approved");
        
        approvedNonprofits[nonprofit] = false;
        emit NonprofitRevoked(nonprofit);
    }

    /**
     * @dev Check if an address is an approved nonprofit
     * @param nonprofit Address to check
     */
    function isApprovedNonprofit(address nonprofit) external view returns (bool) {
        return approvedNonprofits[nonprofit];
    }

    /**
     * @dev Get balance in human-readable format (without decimals)
     * @param account Address to check
     */
    function balanceInTokens(address account) external view returns (uint256) {
        return balanceOf[account] / 10**decimals;
    }

    /**
     * @dev Get total supply in human-readable format
     */
    function totalSupplyInTokens() external view returns (uint256) {
        return totalSupply / 10**decimals;
    }
}
