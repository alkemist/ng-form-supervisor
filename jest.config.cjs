/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    //moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
    transform: {
        '^.+\\.(ts|js|mjs|html|svg)$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
        /*"^.+\\.(js|jsx|mjs)$": "babel-jest",*/
    },
    "transformIgnorePatterns": [
        "/node_modules/(?!@angular)|(?!@alkemist)",
    ],
    setupFilesAfterEnv: ['<rootDir>/test/setup-jest.ts'],
    //moduleDirectories: ["node_modules", "src"],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
