const randomSymbols = ['_', '-', ''];

export const generateRandomHandle = (email: string) => {
  const username = email.split('@')[0].replaceAll('+', '');
  const randomNumber = Math.floor(Math.random() * 9000);

  const randomSymbol = randomSymbols[Math.floor(Math.random() * randomSymbols.length)];

  const first10Letters = username.slice(0, 10);
  const last4Letters = username.slice(username.length - 4);

  return `${first10Letters}${randomSymbol}${last4Letters}${randomNumber}`;
};
