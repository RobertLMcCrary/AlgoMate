//just learning how this unit testing library works

function add(a, b) {
    return a + b;
}

describe('add function', () => {
    it('should add two numbers', () => {
        expect(add(2, 3)).toBe(5);
    });

    it('should add two numbers', () => {
        expect(add(5, 5)).not.toBe(5);
    });
});

describe('Math operations to learn unit testing', () => {
    it('2 + 2 should be 4', () => {
        expect(2 + 2).toBe(4);
    });

    it('10 - 5 should be 5', () => {
        expect(10 - 5).toBe(5);
    });
});

describe('testing length of strings', () => {
    it('length of this string should be 10', () => {
        expect('1234567890').toHaveLength(10);
    });

    it('length of this string should be 10', () => {
        expect('1234567890').toHaveLength(10);
    });
});
