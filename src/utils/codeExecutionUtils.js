//dedicated file for all of the function calls for the every problem

//make sure not to add any white spaces for the python function calls
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
    'merge-sorted-array': (code) => `
${code}
nums1 = input.nums1
m = input.m
nums2 = input.nums2
n = input.n
merge(nums1, m, nums2, n)
    `,
    'find-median-sorted-arrays': (code) => `
${code}
nums1 = input.nums1
nums2 = input.nums2
result = findMedianSortedArrays(nums1, nums2)
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
    'merge-sorted-array': (code) => `
        ${code}
        const nums1 = input.nums1;
        const m = input.m;
        const nums2 = input.nums2;
        const n = input.n;
        merge(nums1, m, nums2, n);
    `,
    'find-median-sorted-arrays': (code) => `
        ${code}
        const nums1 = input.nums1;
        const nums2 = input.nums2;
        return findMedianSortedArrays(nums1, nums2);
    `,
    default: (code) => `
        ${code}
        return solution(input);
    `,
};
