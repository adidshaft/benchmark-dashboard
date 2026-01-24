// src/config/contracts.js

export const CONTRACT_REGISTRY = {
    ethereum: {
        erc20: { 
            name: "USDT (Tether)", 
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", 
            testMethod: "totalSupply",
            testParams: []
        },
        erc721: { 
            name: "BAYC (Bored Ape)", 
            address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", 
            testMethod: "totalSupply",
            testParams: []
        },
        erc1155: {
            name: "Adidas Originals",
            address: "0x285b71f60a0F8F5e975255F06B22516923254e55",
            testMethod: "uri",
            testParams: [0] // Token ID 0
        }
    },
    polygon: {
        erc20: { 
            name: "USDC (Native)", 
            address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", 
            testMethod: "totalSupply", 
            testParams: [] 
        },
        erc721: {
            name: "Lens Protocol Profile",
            address: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
            testMethod: "totalSupply",
            testParams: []
        }
    },
    arbitrum: {
        erc20: { 
            name: "ARB Token", 
            address: "0x912CE59144191C1204E64559FE8253a0e49E6548", 
            testMethod: "totalSupply", 
            testParams: [] 
        }
    },
    optimism: {
        erc20: {
            name: "OP Token",
            address: "0x4200000000000000000000000000000000000042",
            testMethod: "totalSupply",
            testParams: []
        }
    }
};