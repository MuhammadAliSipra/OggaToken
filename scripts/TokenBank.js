// test/TokenBank.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenBank", function () {
  let TokenBank;
  let tokenBank;
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  const TOKEN_NAME = "Ogga Token";
  const TOKEN_SYMBOL = "og";
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
  const DEPOSIT_AMOUNT = ethers.utils.parseEther("100");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy MyToken ERC20 token
    MyToken = await ethers.getContractFactory("OggaToken");
    myToken = await MyToken.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await myToken.deployed();

    // Deploy TokenBank contract
    TokenBank = await ethers.getContractFactory("TokenBank");
    tokenBank = await TokenBank.deploy(myToken.address);
    await tokenBank.deployed();
  });

  it("Should deposit tokens", async function () {
    // Approve TokenBank contract to spend tokens on behalf of addr1
    await myToken.connect(addr1).approve(tokenBank.address, DEPOSIT_AMOUNT);

    // Deposit tokens from addr1
    await tokenBank.connect(addr1).deposit(DEPOSIT_AMOUNT);

    // Check balance of TokenBank contract
    expect(await myToken.balanceOf(tokenBank.address)).to.equal(DEPOSIT_AMOUNT);

    // Check balance of addr1 in TokenBank contract
    expect(await tokenBank.balances(addr1.address)).to.equal(DEPOSIT_AMOUNT);

    // Check balance of addr1
    expect(await myToken.balanceOf(addr1.address)).to.equal(INITIAL_SUPPLY.sub(DEPOSIT_AMOUNT));
  });

  it("Should withdraw tokens", async function () {
    // Approve TokenBank contract to spend tokens on behalf of addr1
    await myToken.connect(addr1).approve(tokenBank.address, DEPOSIT_AMOUNT);

    // Deposit tokens from addr1
    await tokenBank.connect(addr1).deposit(DEPOSIT_AMOUNT);

    // Withdraw tokens from addr1
    await tokenBank.connect(addr1).withdraw(DEPOSIT_AMOUNT);

    // Check balance of TokenBank contract
    expect(await myToken.balanceOf(tokenBank.address)).to.equal(0);

    // Check balance of addr1 in TokenBank contract
    expect(await tokenBank.balances(addr1.address)).to.equal(0);

    // Check balance of addr1
    expect(await myToken.balanceOf(addr1.address)).to.equal(INITIAL_SUPPLY);
  });

  it("Should prevent non-owner from withdrawing all tokens", async function () {
    await expect(
      tokenBank.connect(addr1).withdrawAll()
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should withdraw all tokens by owner", async function () {
    // Approve TokenBank contract to spend tokens on behalf of addr1
    await myToken.connect(addr1).approve(tokenBank.address, DEPOSIT_AMOUNT);

    // Deposit tokens from addr1
    await tokenBank.connect(addr1).deposit(DEPOSIT_AMOUNT);

    // Withdraw all tokens by owner
    await tokenBank.connect(owner).withdrawAll();

    // Check balance of TokenBank contract
    expect(await myToken.balanceOf(tokenBank.address)).to.equal(0);

    // Check balance of owner
    expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
  });
});
