// src/utils/abiEncoder.js

export const FUNCTION_SELECTORS = {
    // ERC20 & ERC721 Common
    name: '0x06fdde03',
    symbol: '0x95d89b41',
    totalSupply: '0x18160ddd',
    
    // ERC20 Specific
    balanceOf: '0x70a08231', // balanceOf(address)
    decimals: '0x313ce567',

    // ERC721 Specific
    ownerOf: '0x6352211e',  // ownerOf(uint256)
    tokenURI: '0xc87b56dd',  // tokenURI(uint256)

    // ERC1155 Specific
    uri: '0x0e89341c'       // uri(uint256)
};

/**
 * Encodes a standard parameter (address or uint256) to 32-byte hex
 */
const encodeParam = (param) => {
    if (typeof param === 'string' && param.startsWith('0x')) {
        // Address padding
        return param.replace('0x', '').padStart(64, '0');
    } else if (typeof param === 'number' || typeof param === 'string') {
        // Number/ID padding
        return Number(param).toString(16).padStart(64, '0');
    }
    return '';
};

export const encodeFunctionCall = (methodName, params = []) => {
    const selector = FUNCTION_SELECTORS[methodName];
    if (!selector) throw new Error(`Unknown method: ${methodName}`);
    
    let encodedParams = params.map(encodeParam).join('');
    return selector + encodedParams;
};