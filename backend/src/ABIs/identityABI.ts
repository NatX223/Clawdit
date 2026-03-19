export const identityRegistryABI = [
    {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "agentId",
            "type": "uint256"
          }
        ],
        "name": "getAgentWallet",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "agentURI",
          "type": "string"
        }
      ],
      "name": "register",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "agentId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
]