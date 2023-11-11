// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract BorrowYourCar is ERC721Enumerable {

    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 duration);

    ERC20 public token;  // ERC-20 token for payment

    constructor(address _tokenAddress)
    ERC721("ZKY", "SYM1") {
        token = ERC20(_tokenAddress);
        mint(0x5F4231c6b543e008BAcc9F09593Eba18Ba57ab72, 1);
        mint(0x5F4231c6b543e008BAcc9F09593Eba18Ba57ab72, 2);
        mint(0x5F4231c6b543e008BAcc9F09593Eba18Ba57ab72, 3);
        mint(0xDD38dbe2aCB5BBa3b059400839a2307512D1e9a4, 4);
        mint(0xDD38dbe2aCB5BBa3b059400839a2307512D1e9a4, 5);
        mint(0xDD38dbe2aCB5BBa3b059400839a2307512D1e9a4, 6);
    }

    // Struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }


    // Mapping from car ID to Car struct
    mapping(uint256 => Car) public cars;

    // List of cars that are not currently borrowed
    uint256[] public availableCars;

    // For test, get new NFT
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
        cars[tokenId].owner = to;
        addAvailableCar(tokenId);
    }
    // Function to add a car to the availableCars list
    function addAvailableCar(uint256 carTokenId) internal {
        availableCars.push(carTokenId);
    }

    // Function to remove a car from the availableCars list
    function removeAvailableCar(uint256 carTokenId) internal {
        for (uint256 i = 0; i < availableCars.length; i++) {
            if (availableCars[i] == carTokenId) {
                availableCars[i] = availableCars[availableCars.length - 1];
                availableCars.pop();
                break;
            }
        }
    }

    // View function to get the list of owned cars for a user
    function getOwnedCars() public view returns (uint256[] memory) {
        uint256 balance = balanceOf(msg.sender);
        uint256[] memory ownedCars = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            ownedCars[i] = tokenOfOwnerByIndex(msg.sender, i);
        }
        return ownedCars;
    }

    // View function to get the list of available cars
    function getAvailableCars() public view returns (uint256[] memory) {
        return availableCars;
    }
    
    // View function to get car information
    function getCarInfo(uint256 carTokenId) public view returns (address owner, address borrower, uint256 borrowUntil) {
        Car storage car = cars[carTokenId];
        return (car.owner, car.borrower, car.borrowUntil);
    }

    // Function to borrow a car for a specific duration
    function borrowCar(uint256 carTokenId, uint256 duration) public {
        require(ownerOf(carTokenId) != msg.sender, "You can't borrow your own car");
        require(cars[carTokenId].borrower == address(0), "Car is already borrowed");

        removeAvailableCar(carTokenId);  // Remove the car from availableCars list
        cars[carTokenId].borrower = msg.sender;
        cars[carTokenId].borrowUntil = block.timestamp + duration;

        emit CarBorrowed(carTokenId, msg.sender, block.timestamp, duration);
    }

    // Function to return a borrowed car
    function returnCar(uint256 carTokenId) public {
        require(cars[carTokenId].borrower == msg.sender, "You can only return a car that you borrowed");

        cars[carTokenId].borrower = address(0);
        cars[carTokenId].borrowUntil = 0;
        addAvailableCar(carTokenId);  // Add the car back to availableCars list
    }

    // Function to pay for renting a car using ERC-20 tokens
    function payRent(uint256 carTokenId, uint256 amount) public {
        require(cars[carTokenId].borrower == msg.sender, "You can only pay for a car you borrowed");

        // Assuming ERC-20 transferFrom function is used for payment
        token.transferFrom(msg.sender, ownerOf(carTokenId), amount);
    }
}