export default {
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  clearMocks: true,
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "json", "node"]
};
