//dedicated file for all of the function calls for the every problem

//make sure not to add any white space or indent because python sucks
export const pythonFunctionCalls = {
    'two-sum': (code) => `
${code}
nums = input.nums
target = input.target
result = twoSum(nums, target)
    `,
    'reverse-string': (code) => `
${code}
s = input.s
result = reverseString(s)
    `,
    'palindrome-number': (code) => `
${code}
x = input.x
result = isPalindrome(x)
    `,
    'roman-to-integer': (code) => `
${code}
s = input.s
result = romanToInt(s)
    `,
    'three-sum': (code) => `
${code}
nums = input.nums
result = threeSum(nums)
    `,
    'longest-substring-without-repeating-characters': (code) => `
${code}
s = input.s
result = lengthOfLongestSubstring(s)
    `,
    'minimum-window-substring': (code) => `
${code}
s = input.s
t = input.t
result = minWindow(s, t)
    `,
    'longest-valid-parentheses': (code) => `
${code}
s = input.s
result = longestValidParentheses(s)
    `,
    default: (code) => `
${code}
result = solution(input)
    `,
};

export const javascriptFunctionCalls = {
    'two-sum': (code) => `
        ${code}
        const nums = input.nums;
        const target = input.target;
        return twoSum(nums, target);
    `,
    'reverse-string': (code) => `
        ${code}
        const s = input.s;
        return reverseString(s);
    `,
    'palindrome-number': (code) => `
        ${code}
        const x = input.x;
        return isPalindrome(x);
    `,
    'roman-to-integer': (code) => `
        ${code}
        const s = input.s;
        return romanToInt(s);
    `,
    'three-sum': (code) => `
        ${code}
        const nums = input.nums;
        return threeSum(nums);
    `,
    'longest-substring-without-repeating-characters': (code) => `
        ${code}
        const s = input.s;
        return lengthOfLongestSubstring(s);
    `,
    'minimum-window-substring': (code) => `
        ${code}
        const s = input.s;
        const t = input.t;
        return minWindow(s, t);
    `,
    'longest-valid-parentheses': (code) => `
        ${code}
        const s = input.s;
        return longestValidParentheses(s);
    `,
    default: (code) => `
        ${code}
        return solution(input);
    `,
};
