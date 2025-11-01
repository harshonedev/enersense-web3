// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EnergyMarketplace
 * @dev Peer-to-peer marketplace for trading ENRG tokens
 * Supports listings with native currency (ETH) payments
 */
contract EnergyMarketplace is ReentrancyGuard {
    IERC20 public enrgToken;
    
    struct Listing {
        uint256 id;
        address seller;
        uint256 tokenAmount;
        uint256 pricePerToken;
        bool active;
    }
    
    uint256 public nextListingId = 1;
    mapping(uint256 => Listing) public listings;
    
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint256 tokenAmount,
        uint256 pricePerToken
    );
    
    event ListingSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 totalPrice
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    constructor(address _enrgToken) {
        require(_enrgToken != address(0), "Invalid token address");
        enrgToken = IERC20(_enrgToken);
    }
    
    /**
     * @dev Create a new listing
     * @param tokenAmount Amount of ENRG tokens to sell
     * @param pricePerToken Price per token in wei (native currency)
     */
    function createListing(uint256 tokenAmount, uint256 pricePerToken) external returns (uint256) {
        require(tokenAmount > 0, "Invalid token amount");
        require(pricePerToken > 0, "Invalid price");
        require(
            enrgToken.transferFrom(msg.sender, address(this), tokenAmount),
            "Token transfer failed"
        );
        
        uint256 listingId = nextListingId++;
        
        listings[listingId] = Listing({
            id: listingId,
            seller: msg.sender,
            tokenAmount: tokenAmount,
            pricePerToken: pricePerToken,
            active: true
        });
        
        emit ListingCreated(listingId, msg.sender, tokenAmount, pricePerToken);
        
        return listingId;
    }
    
    /**
     * @dev Buy tokens from a listing
     * @param listingId ID of the listing to purchase
     */
    function buyListing(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy own listing");
        
        uint256 totalPrice = listing.tokenAmount * listing.pricePerToken;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Mark listing as inactive
        listing.active = false;
        
        // Transfer tokens to buyer
        require(
            enrgToken.transfer(msg.sender, listing.tokenAmount),
            "Token transfer failed"
        );
        
        // Transfer payment to seller
        (bool success, ) = listing.seller.call{value: totalPrice}("");
        require(success, "Payment transfer failed");
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit ListingSold(listingId, msg.sender, listing.seller, listing.tokenAmount, totalPrice);
    }
    
    /**
     * @dev Cancel a listing and return tokens to seller
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.active = false;
        
        // Return tokens to seller
        require(
            enrgToken.transfer(listing.seller, listing.tokenAmount),
            "Token transfer failed"
        );
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Get listing details
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    /**
     * @dev Calculate total price for a listing
     */
    function getListingTotalPrice(uint256 listingId) external view returns (uint256) {
        Listing storage listing = listings[listingId];
        return listing.tokenAmount * listing.pricePerToken;
    }
}
