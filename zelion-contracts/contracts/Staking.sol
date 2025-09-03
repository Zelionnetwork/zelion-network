// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public stakingToken;
    
    uint256 public rewardRate = 100; // 100 basis points = 1% per period
    uint256 public constant REWARD_DENOMINATOR = 10000;
    uint256 public constant REWARD_PERIOD = 1 days;
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
    }
    
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        
        // Claim pending rewards if any
        if (stakes[msg.sender].amount > 0) {
            _claimRewards(msg.sender);
        }
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot unstake 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient staked amount");
        
        // Claim pending rewards
        _claimRewards(msg.sender);
        
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        if (stakes[msg.sender].amount == 0) {
            delete stakes[msg.sender];
        }
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    function claimRewards() external nonReentrant {
        require(stakes[msg.sender].amount > 0, "No staked amount");
        _claimRewards(msg.sender);
    }
    
    function _claimRewards(address user) internal {
        uint256 reward = pendingRewards(user);
        if (reward > 0) {
            stakes[user].lastClaimTime = block.timestamp;
            
            // Mint rewards to user (requires stakingToken to have mint function)
            // For testnet, we'll use the faucetMint function
            (bool success, ) = address(stakingToken).call(
                abi.encodeWithSignature("faucetMint(address,uint256)", user, reward)
            );
            
            if (!success) {
                // If minting fails, transfer from contract balance
                uint256 contractBalance = stakingToken.balanceOf(address(this));
                uint256 availableRewards = contractBalance > totalStaked ? contractBalance - totalStaked : 0;
                
                if (availableRewards >= reward) {
                    stakingToken.safeTransfer(user, reward);
                } else if (availableRewards > 0) {
                    stakingToken.safeTransfer(user, availableRewards);
                    reward = availableRewards;
                } else {
                    reward = 0;
                }
            }
            
            if (reward > 0) {
                emit RewardsClaimed(user, reward);
            }
        }
    }
    
    function pendingRewards(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) {
            return 0;
        }
        
        uint256 timeDiff = block.timestamp - stakeInfo.lastClaimTime;
        uint256 periods = timeDiff / REWARD_PERIOD;
        
        if (periods == 0) {
            return 0;
        }
        
        return (stakeInfo.amount * rewardRate * periods) / REWARD_DENOMINATOR;
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return stakes[account].amount;
    }
    
    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Rate too high"); // Max 10% per period
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }
    
    function depositRewards(uint256 amount) external onlyOwner {
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 contractBalance = stakingToken.balanceOf(address(this));
        uint256 availableRewards = contractBalance > totalStaked ? contractBalance - totalStaked : 0;
        
        if (availableRewards > 0) {
            stakingToken.safeTransfer(owner(), availableRewards);
        }
    }
    
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 pending
    ) {
        StakeInfo memory info = stakes[user];
        return (info.amount, info.startTime, info.lastClaimTime, pendingRewards(user));
    }
}
