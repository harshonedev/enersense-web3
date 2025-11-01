// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./ENRGToken.sol";

/**
 * @title VoucherMinter
 * @dev Enables secure, voucher-based minting of ENRG tokens
 * Prevents unauthorized minting and ensures energy measurements are verified
 * Integrates with kWALA workflow automation for trustless minting
 */
contract VoucherMinter {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    ENRGToken public enrgToken;
    address public signer;
    
    struct Voucher {
        address user;
        uint256 amount;
        uint256 nonce;
        uint256 expiry;
        bytes32 deviceId;
    }
    
    // Track used nonces to prevent replay attacks
    mapping(address => mapping(uint256 => bool)) public usedNonces;
    
    event TokensMinted(address indexed user, uint256 amount, uint256 nonce);
    event VoucherRedeemed(address indexed user, bytes32 deviceId, uint256 kwhAmount);
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    
    constructor(address _enrgToken, address _signer) {
        require(_enrgToken != address(0), "Invalid token address");
        require(_signer != address(0), "Invalid signer address");
        enrgToken = ENRGToken(_enrgToken);
        signer = _signer;
    }
    
    /**
     * @dev Redeem a voucher to mint ENRG tokens
     * @param voucher The voucher containing mint parameters
     * @param signature Signature from authorized signer (kWALA workflow)
     */
    function redeem(Voucher calldata voucher, bytes calldata signature) external {
        require(voucher.user == msg.sender, "Invalid user");
        require(block.timestamp <= voucher.expiry, "Voucher expired");
        require(!usedNonces[voucher.user][voucher.nonce], "Nonce already used");
        require(voucher.amount > 0, "Invalid amount");
        
        // Verify signature
        bytes32 hash = _hashVoucher(voucher);
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(signature);
        
        require(recoveredSigner == signer, "Invalid signature");
        
        // Mark nonce as used
        usedNonces[voucher.user][voucher.nonce] = true;
        
        // Mint tokens
        enrgToken.mint(voucher.user, voucher.amount);
        
        emit TokensMinted(voucher.user, voucher.amount, voucher.nonce);
        emit VoucherRedeemed(voucher.user, voucher.deviceId, voucher.amount / 1e18);
    }
    
    /**
     * @dev Hash a voucher for signature verification
     */
    function _hashVoucher(Voucher calldata voucher) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                voucher.user,
                voucher.amount,
                voucher.nonce,
                voucher.expiry,
                voucher.deviceId
            )
        );
    }
    
    /**
     * @dev Update the authorized signer (kWALA workflow address)
     * @param _signer New signer address
     */
    function updateSigner(address _signer) external {
        require(msg.sender == signer, "Only current signer can update");
        require(_signer != address(0), "Invalid signer address");
        emit SignerUpdated(signer, _signer);
        signer = _signer;
    }
    
    /**
     * @dev Check if a voucher hash has been used
     */
    function isNonceUsed(address user, uint256 nonce) external view returns (bool) {
        return usedNonces[user][nonce];
    }
}
