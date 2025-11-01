// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EnergyEventEmitter
 * @dev Simple contract that emits events when surplus energy is detected
 * kWALA workflows can listen to these events and trigger minting
 */
contract EnergyEventEmitter {
    event SurplusEnergyDetected(
        address indexed userAddress,
        bytes32 indexed deviceId,
        uint256 surplusKwh,
        uint256 timestamp,
        uint256 nonce
    );

    // Track nonces to prevent duplicate events
    mapping(bytes32 => bool) public usedNonces;

    // Only authorized addresses can emit events (your backend API)
    address public authorizedEmitter;

    constructor() {
        authorizedEmitter = msg.sender;
    }

    /**
     * @dev Update the authorized emitter address
     */
    function setAuthorizedEmitter(address _emitter) external {
        require(msg.sender == authorizedEmitter, "Unauthorized");
        authorizedEmitter = _emitter;
    }

    /**
     * @dev Emit surplus energy event
     * @param userAddress Address of the energy producer
     * @param deviceId Device identifier hash
     * @param surplusKwh Surplus energy in kWh (will be converted to wei for token amount)
     * @param timestamp Unix timestamp of energy reading
     * @param nonce Unique nonce to prevent replay
     */
    function emitSurplusEnergy(
        address userAddress,
        bytes32 deviceId,
        uint256 surplusKwh,
        uint256 timestamp,
        uint256 nonce
    ) external {
        require(msg.sender == authorizedEmitter, "Unauthorized");
        require(userAddress != address(0), "Invalid user address");
        require(surplusKwh > 0, "Invalid surplus amount");

        // Create unique nonce identifier
        bytes32 nonceHash = keccak256(
            abi.encodePacked(userAddress, deviceId, nonce)
        );
        require(!usedNonces[nonceHash], "Nonce already used");

        // Mark nonce as used
        usedNonces[nonceHash] = true;

        // Emit event that kWALA will listen to
        emit SurplusEnergyDetected(
            userAddress,
            deviceId,
            surplusKwh,
            timestamp,
            nonce
        );
    }

    /**
     * @dev Check if a nonce has been used
     */
    function isNonceUsed(bytes32 nonceHash) external view returns (bool) {
        return usedNonces[nonceHash];
    }
}
