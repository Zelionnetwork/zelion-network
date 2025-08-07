import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import StakingABI from '../abis/Staking.json';
import TokenABI from '../abis/ZYLToken.json';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const StakingDashboard = () => {
  const { account, library, chainId } = useWeb3React();
  const [stakingData, setStakingData] = useState({
    totalStaked: '0',
    rewards: '0',
    apy: '10',
    stakedBalance: '0',
    lockPeriod: 30,
    unlockTime: 0
  });
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('flexible');
  
  const STAKING_CONTRACT = process.env.REACT_APP_STAKING_CONTRACT;
  const TOKEN_CONTRACT = process.env.REACT_APP_TOKEN_CONTRACT;

  useEffect(() => {
    if (account) {
      loadStakingData();
    }
  }, [account, chainId]);

  const loadStakingData = async () => {
    setIsLoading(true);
    try {
      const provider = library.getSigner();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT, StakingABI, provider);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT, TokenABI, provider);
      
      const stakedBalance = await stakingContract.stakedBalance(account);
      const rewards = await stakingContract.calculateReward(account);
      const totalStaked = await stakingContract.totalStaked();
      const userStakes = await stakingContract.getUserStakes(account);
      
      // Calculate time until unlock
      let unlockTime = 0;
      if (userStakes.length > 0 && userStakes[0].lockPeriod > 0) {
        const endTime = Number(userStakes[0].startTime) + Number(userStakes[0].lockPeriod);
        unlockTime = endTime - Math.floor(Date.now() / 1000);
      }
      
      // Calculate APY based on lock period
      let apy = 10; // Default for flexible
      if (userStakes.length > 0 && userStakes[0].lockPeriod > 0) {
        const monthsLocked = Math.floor(userStakes[0].lockPeriod / (30 * 24 * 3600));
        apy = 10 + (monthsLocked * 5);
      }
      
      setStakingData({
        totalStaked: formatEther(totalStaked),
        rewards: formatEther(rewards),
        apy: apy.toString(),
        stakedBalance: formatEther(stakedBalance),
        lockPeriod: userStakes.length > 0 ? userStakes[0].lockPeriod : 30,
        unlockTime
      });
    } catch (error) {
      console.error('Error loading staking data:', error);
    }
    setIsLoading(false);
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    try {
      setIsLoading(true);
      const provider = library.getSigner();
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT, TokenABI, provider);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT, StakingABI, provider);
      
      // Approve tokens
      await tokenContract.approve(STAKING_CONTRACT, parseEther(stakeAmount));
      
      // Stake tokens
      if (activeTab === 'flexible') {
        await stakingContract.stakeFlexible(parseEther(stakeAmount));
      } else {
        await stakingContract.stakeLocked(parseEther(stakeAmount), stakingData.lockPeriod * 24 * 3600);
      }
      
      await loadStakingData();
      setStakeAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
    }
    setIsLoading(false);
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return;
    
    try {
      setIsLoading(true);
      const provider = library.getSigner();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT, StakingABI, provider);
      
      await stakingContract.unstake(parseEther(unstakeAmount));
      await loadStakingData();
      setUnstakeAmount('');
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
    setIsLoading(false);
  };

  const handleClaimRewards = async () => {
    try {
      setIsLoading(true);
      const provider = library.getSigner();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT, StakingABI, provider);
      
      await stakingContract.claimRewards();
      await loadStakingData();
    } catch (error) {
      console.error('Claiming rewards failed:', error);
    }
    setIsLoading(false);
  };

  const percentage = stakingData.unlockTime > 0 ? 
    Math.max(0, 100 - (stakingData.unlockTime / (stakingData.lockPeriod * 24 * 3600) * 100)) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">Staking Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Staked</h3>
          <p className="text-2xl font-bold text-indigo-600">{stakingData.stakedBalance} ZYL</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Rewards Earned</h3>
          <p className="text-2xl font-bold text-green-600">{stakingData.rewards} ZYL</p>
          <button 
            onClick={handleClaimRewards}
            disabled={isLoading || parseFloat(stakingData.rewards) === 0}
            className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Claim Rewards
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">APY</h3>
          <div className="w-24 h-24">
            <CircularProgressbar
              value={stakingData.apy}
              text={`${stakingData.apy}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: `rgba(99, 102, 241, ${parseInt(stakingData.apy) / 100})`,
                textColor: '#4F46E5',
                trailColor: '#E5E7EB',
              })}
            />
          </div>
        </div>
      </div>
      
      <div className="flex border-b mb-6">
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'flexible' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('flexible')}
        >
          Flexible Staking
        </button>
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'locked' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('locked')}
        >
          Locked Staking
        </button>
      </div>
      
      {activeTab === 'flexible' ? (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Flexible Staking</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">Amount to Stake</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter ZYL amount"
              />
              <button
                onClick={handleStake}
                disabled={isLoading}
                className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Staking...' : 'Stake Tokens'}
              </button>
            </div>
            
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">Amount to Unstake</label>
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter ZYL amount"
              />
              <button
                onClick={handleUnstake}
                disabled={isLoading}
                className="mt-4 w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Unstaking...' : 'Unstake Tokens'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">Flexible Staking Details</h3>
            <ul className="mt-2 list-disc list-inside text-blue-700">
              <li>10% APY - Earn rewards daily</li>
              <li>No lock-in period - Unstake anytime</li>
              <li>Rewards compound automatically</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Locked Staking</h2>
          
          {stakingData.unlockTime > 0 ? (
            <div className="text-center mb-6">
              <div className="w-40 h-40 mx-auto">
                <CircularProgressbar
                  value={percentage}
                  text={`${Math.round(percentage)}%`}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: '#10B981',
                    textColor: '#047857',
                    trailColor: '#E5E7EB',
                  })}
                />
              </div>
              <p className="mt-4 text-gray-600">
                {stakingData.unlockTime > 0 
                  ? `Your tokens unlock in ${Math.ceil(stakingData.unlockTime / (24 * 3600))} days` 
                  : 'Your tokens are unlocked!'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Lock Period (days)</label>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={stakingData.lockPeriod}
                  onChange={(e) => setStakingData({...stakingData, lockPeriod: e.target.value})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>30 days</span>
                  <span className="font-semibold">{stakingData.lockPeriod} days</span>
                  <span>180 days</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount to Stake</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter ZYL amount"
                />
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                <h3 className="font-semibold text-yellow-800">APY Calculation</h3>
                <p className="mt-2">
                  {stakingData.lockPeriod} days lock = {10 + (Math.floor(stakingData.lockPeriod / 30) * 5)}% APY
                </p>
              </div>
              
              <button
                onClick={handleStake}
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Staking...' : 'Lock Tokens'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StakingDashboard;
