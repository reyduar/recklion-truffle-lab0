const GanacheLab0 = artifacts.require("GanacheLab0");

contract("GanacheLab0", (accounts) => {
  let ganacheLabInstance;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  // Deploy a fresh contract before each test
  beforeEach(async () => {
    ganacheLabInstance = await GanacheLab0.new({ from: owner });
  });

  describe("Contract Deployment", () => {
    it("should deploy successfully", async () => {
      assert(ganacheLabInstance.address !== "");
      assert(ganacheLabInstance.address !== 0x0);
      assert(ganacheLabInstance.address !== null);
      assert(ganacheLabInstance.address !== undefined);
    });

    it("should set the correct owner", async () => {
      const contractOwner = await ganacheLabInstance.owner();
      assert.equal(contractOwner, owner, "Owner should be set correctly");
    });

    it("should set the correct smart contract address", async () => {
      const contractAddress = await ganacheLabInstance.smartContract();
      assert.equal(
        contractAddress,
        ganacheLabInstance.address,
        "Smart contract address should be set correctly"
      );
    });

    it("should emit newContract event on deployment", async () => {
      // Deploy a new instance to capture the event
      const newInstance = await GanacheLab0.new({ from: owner });
      const receipt = await web3.eth.getTransactionReceipt(
        newInstance.transactionHash
      );

      // Check if the event was emitted
      assert.equal(receipt.logs.length, 1, "Should emit one event");

      // Decode the event
      const decodedLogs = await newInstance.getPastEvents("newContract", {
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      assert.equal(decodedLogs.length, 1, "Should emit newContract event");
      assert.equal(
        decodedLogs[0].returnValues.owner,
        owner,
        "Event should contain correct owner"
      );
      assert.equal(
        decodedLogs[0].returnValues.smartContract,
        newInstance.address,
        "Event should contain correct contract address"
      );
    });
  });

  describe("Message Functionality", () => {
    it("should have empty message initially", async () => {
      const initialMessage = await ganacheLabInstance.getMessage();
      assert.equal(initialMessage, "", "Initial message should be empty");
    });

    it("should set message correctly", async () => {
      const testMessage = "Hello, Blockchain!";
      await ganacheLabInstance.setMessage(testMessage, { from: owner });

      const retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        retrievedMessage,
        testMessage,
        "Message should be set correctly"
      );
    });

    it("should emit newMessage event when setting message", async () => {
      const testMessage = "Test message for event";
      const result = await ganacheLabInstance.setMessage(testMessage, {
        from: owner,
      });

      // Check if the event was emitted
      assert.equal(result.logs.length, 1, "Should emit one event");
      assert.equal(
        result.logs[0].event,
        "newMessage",
        "Should emit newMessage event"
      );
      assert.equal(
        result.logs[0].args.message,
        testMessage,
        "Event should contain the correct message"
      );
    });

    it("should allow owner to set message", async () => {
      const testMessage = "Owner message";
      await ganacheLabInstance.setMessage(testMessage, { from: owner });

      const retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        retrievedMessage,
        testMessage,
        "Owner should be able to set message"
      );
    });

    it("should allow any user to set message", async () => {
      const testMessage = "User1 message";
      await ganacheLabInstance.setMessage(testMessage, { from: user1 });

      const retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        retrievedMessage,
        testMessage,
        "Any user should be able to set message"
      );
    });

    it("should overwrite previous message", async () => {
      const firstMessage = "First message";
      const secondMessage = "Second message";

      await ganacheLabInstance.setMessage(firstMessage, { from: owner });
      let retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        retrievedMessage,
        firstMessage,
        "First message should be set"
      );

      await ganacheLabInstance.setMessage(secondMessage, { from: user1 });
      retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        retrievedMessage,
        secondMessage,
        "Second message should overwrite first"
      );
    });

    it("should handle empty string message", async () => {
      const emptyMessage = "";
      await ganacheLabInstance.setMessage(emptyMessage, { from: owner });

      const retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        retrievedMessage,
        emptyMessage,
        "Should handle empty string message"
      );
    });

    it("should handle long message", async () => {
      const longMessage =
        "This is a very long message that contains multiple words and should test the contract's ability to handle longer strings without any issues or problems.";
      await ganacheLabInstance.setMessage(longMessage, { from: owner });

      const retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(retrievedMessage, longMessage, "Should handle long message");
    });

    it("should handle special characters in message", async () => {
      const specialMessage = "Hello! @#$%^&*()_+ 123 áéíóú ñ";
      await ganacheLabInstance.setMessage(specialMessage, { from: owner });

      const retrievedMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        retrievedMessage,
        specialMessage,
        "Should handle special characters"
      );
    });
  });

  describe("Multiple Users Interaction", () => {
    it("should allow multiple users to set messages sequentially", async () => {
      const messages = [
        { user: owner, message: "Owner's message" },
        { user: user1, message: "User1's message" },
        { user: user2, message: "User2's message" },
      ];

      for (let i = 0; i < messages.length; i++) {
        await ganacheLabInstance.setMessage(messages[i].message, {
          from: messages[i].user,
        });
        const retrievedMessage = await ganacheLabInstance.getMessage();
        assert.equal(
          retrievedMessage,
          messages[i].message,
          `Message ${i + 1} should be set correctly`
        );
      }
    });

    it("should maintain latest message regardless of sender", async () => {
      await ganacheLabInstance.setMessage("First", { from: owner });
      await ganacheLabInstance.setMessage("Second", { from: user1 });
      await ganacheLabInstance.setMessage("Third", { from: user2 });

      const finalMessage = await ganacheLabInstance.getMessage();
      assert.equal(finalMessage, "Third", "Should maintain the latest message");
    });
  });

  describe("Gas Usage Tests", () => {
    it("should use reasonable gas for setting message", async () => {
      const testMessage = "Gas test message";
      const result = await ganacheLabInstance.setMessage(testMessage, {
        from: owner,
      });

      // Gas usage should be reasonable (less than 100,000 gas)
      assert.isBelow(
        result.receipt.gasUsed,
        100000,
        "Gas usage should be reasonable"
      );
    });

    it("should use reasonable gas for getting message", async () => {
      await ganacheLabInstance.setMessage("Test", { from: owner });

      // Getting message should be a view function with minimal gas
      const result = await ganacheLabInstance.getMessage.estimateGas();
      assert.isBelow(result, 50000, "Getting message should use minimal gas");
    });
  });

  describe("Contract State Persistence", () => {
    it("should persist message across multiple transactions", async () => {
      const testMessage = "Persistent message";

      await ganacheLabInstance.setMessage(testMessage, { from: owner });

      // Perform some other operations
      await ganacheLabInstance.setMessage("Temporary", { from: user1 });
      await ganacheLabInstance.setMessage(testMessage, { from: owner });

      const finalMessage = await ganacheLabInstance.getMessage();
      assert.equal(
        finalMessage,
        testMessage,
        "Message should persist correctly"
      );
    });
  });
});
