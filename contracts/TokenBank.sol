// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenBank
 * @dev A smart contract for managing deposits and withdrawals of ERC20 tokens.
 */
contract TokenBank is ReentrancyGuard {
    IERC20 public token; // The ERC20 token being managed by the contract
    mapping(address => uint256) public balances; // Mapping to track user balances
    address public owner; // The owner of the contract

    event Deposit(address indexed user, uint256 amount); // Event emitted when a user deposits tokens
    event Withdrawal(address indexed user, uint256 amount); // Event emitted when a user withdraws tokens

    /**
     * @dev Modifier to restrict access to only the owner of the contract.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /**
     * @dev Modifier to ensure the amount passed is greater than 0.
     * @param amount The amount to be checked.
     */
    modifier amountGreaterThanZero(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }

    /**
     * @dev Constructor function.
     * @param _token Address of the ERC20 token contract to be managed.
     */
    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    /**
     * @dev Deposits ERC20 tokens into the contract.
     * @param amount The amount of tokens to deposit.
     */
    function deposit(uint256 amount) external nonReentrant amountGreaterThanZero(amount) payable {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Withdraws ERC20 tokens from the contract.
     * @param amount The amount of tokens to withdraw.
     */
    function withdraw(uint256 amount) external nonReentrant amountGreaterThanZero(amount) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Withdraws all ERC20 tokens from the contract.
     * Only callable by the contract owner.
     */
    function withdrawAll() external nonReentrant onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(token.transfer(owner, balance), "Transfer failed");
        emit Withdrawal(owner, balance);
    }

    /**
     * prevent @dev to sent ether
     * Fallback function to reject ether sent to this contract
     */
    receive() external payable {
        revert("This contract does not accept ether");
    }
}
