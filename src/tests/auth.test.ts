import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, getAPIKey, getBearerToken, hashPassword, makeJWT, validateJWT } from "../auth";

describe("Password Hashing", () => {
    const password1 = "correctPassword123!";
    const password2 = "anotherPassword456!";
    let hash1: string;
    let hash2: string;

    beforeAll(async () => {
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
    });

    it("should return true for the correct password", async () => {
        const result = await checkPasswordHash(password1, hash1);
        expect(result).toBe(true);
    });

    it("should return false for the incorrect password", async () => {
        const result = await checkPasswordHash(password2, hash1);
        expect(result).toBe(false);
    });
});

describe("JWT signing", () => {
   
    let userId = "someuserId123";
    
    const jwt = makeJWT(userId, "secret");
    
    it("should return userId after verification", () => {
        const result = validateJWT(jwt, "secret");
        expect(result).toBe("someuserId123");
    })

    it("should throw when invalid", () => {
        expect(() => validateJWT(jwt, "faslesecret"))
            .toThrowError("JWT invalid or expired");
    })

    it.skip("should throw when expired", async () => {
        await new Promise(r => setTimeout(r, 3000));
        expect(() => validateJWT(jwt, "faslesecret"))
            .toThrowError("JWT invalid or expired");
    });
})

describe("Extracting bearer token", () => {
    const mockRequest: any = {
        get: (name:string): string | undefined => { 
            return name === "Authorization" 
                ? "Bearer 123.456" 
                : undefined
            }
    };

    const mockRequestInvalid: any = {
        get: (name:string): string | undefined => { 
            return undefined
        }
    };

    it("should return only the token", () => {
         const result = getBearerToken(mockRequest);
         expect(result).toBe("123.456");
    });

    it("should throw if Authentication header is missing", () => {
        expect(() => getBearerToken(mockRequestInvalid))
            .toThrow("Missing or invalid JWT token");
    })
})

describe("Extracting API key", () => {
    const mockRequest: any = {
        get: (name:string): string | undefined => { 
            return name === "Authorization" 
                ? "ApiKey 123.456" 
                : undefined
            }
    };

    const mockRequestInvalid: any = {
        get: (name:string): string | undefined => { 
            return undefined
        }
    };

    it("should return only the api key", () => {
         const result = getAPIKey(mockRequest);
         expect(result).toBe("123.456");
    });

    it("should throw if Authentication header is missing", () => {
        expect(() => getAPIKey(mockRequestInvalid))
            .toThrow("Missing Api key");
    })
})