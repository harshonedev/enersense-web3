// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ENRGToken
 * @dev ERC20 token representing renewable energy units (1 ENRG = 1 kWh)
 * Only the VoucherMinter contract can mint new tokens
 */
contract ENRGToken is ERC20, Ownable {
    address public minter;
    
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);
    
    constructor() ERC20("Energy Token", "ENRG") Ownable(msg.sender) {}
    
    /**
     * @dev Set the authorized minter contract
     * @param _minter Address of the VoucherMinter contract
     */
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter address");
        emit MinterUpdated(minter, _minter);
        minter = _minter;
    }
    
    /**
     * @dev Mint new ENRG tokens (only callable by minter contract)
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only minter can mint");
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (for redemption scenarios)
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
