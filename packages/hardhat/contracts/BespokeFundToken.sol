// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGivingFundToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

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
    
    mapping(address => bool) public approvedNonprofits;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed user, uint256 amount);
    event Redeemed(address indexed redeemer, uint256 amount);
    event NonprofitApproved(address indexed nonprofit);
    event NonprofitRemoved(address indexed nonprofit);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _owner,
        address _gfToken,
        address[] memory _nonprofits
    ) {
        name = _name;
        symbol = _symbol;
        owner = _owner;
        gfToken = _gfToken;
        factory = msg.sender;

        // Approve initial nonprofits
        for (uint i = 0; i < _nonprofits.length; i++) {
            approvedNonprofits[_nonprofits[i]] = true;
            emit NonprofitApproved(_nonprofits[i]);
        }
    }

    /**
     * @dev Mint bespoke tokens by depositing GF tokens (1:1)
     * @param amount Amount of GF tokens to deposit
     */
    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        // Transfer GF tokens from user to this contract
        require(
            IGivingFundToken(gfToken).transferFrom(msg.sender, address(this), amount),
            "GF transfer failed"
        );

        // Mint bespoke tokens
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
    function redeem(uint256 amount) external whenFactoryNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(
            approvedNonprofits[msg.sender] || msg.sender == owner,
            "Only approved nonprofits or owner"
        );
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        // Burn bespoke tokens
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
     * @dev Get GF token balance held by this contract
     */
    function gfTokenReserve() external view returns (uint256) {
        return IGivingFundToken(gfToken).balanceOf(address(this));
    }
}