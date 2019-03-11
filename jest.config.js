module.exports = {
    "collectCoverage": true,
    "coverageDirectory": "./coverage",
    "moduleFileExtensions": [
        "js",
        "ts",
        "json"
    ],
    "testRegex": "(spec.ts)$",
    "transform": {
        "^.+\\.ts?$": "ts-jest"
    },
    "transformIgnorePatterns": [
        "<rootDir>/node_modules/(?!@cubbit)"
    ],
    "globals": {
        "ts-jest": {
            "tsConfig": "./tsconfig.json"
        }
    }
}
