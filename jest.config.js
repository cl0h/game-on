module.exports = {
    testPathIgnorePatterns: [
        '/node_modules/',
        '/jest-codemods/',
        '/rewiremock-test/'
    ],
    transform: {
        '^.+\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
    testEnvironment: 'node',
    transformIgnorePatterns: [
        '/node_modules/(?!(chai)/)'
    ]
};