module.exports = function (message) {
  if (process.env.NODE_ENV === "production") return;
  console.log("Tejat: ", message);
};
