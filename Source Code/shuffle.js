/**
 * Project: Math Sprint Game
 * File: shuffle.js
 * Date: February 17, 2022
 * Description: Utility function to shuffle array elements (Fisher-Yates algorithm).
 * 
 * Created by: Amey Thakur (https://github.com/Amey-Thakur) & Mega Satish (https://github.com/msatmod)
 * Repository: https://github.com/Amey-Thakur/MATH-SPRINT-GAME
 * License: MIT
 */
/**
 * Fisher-Yates Shuffle Algorithm (In-Place)
 * Randomizes the order of elements in an array.
 * Iterates backwards from the end of the array, swapping the current element
 * with a randomly selected element from the preceding indices.
 * Tme Complexity: O(n)
 */
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Used like so
//   var arr = [2, 11, 37, 42];
//   shuffle(arr);
//   console.log(arr);