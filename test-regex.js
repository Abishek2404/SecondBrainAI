const regex = /\\s+/g;
console.log('hello   world'.replace(regex, 'X'));
console.log('hello \\s\\s world'.replace(regex, 'X'));
