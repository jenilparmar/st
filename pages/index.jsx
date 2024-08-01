'use client';
import { useState, useRef, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { LiaGem } from "react-icons/lia";
import { GiRollingBomb } from "react-icons/gi";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const randomWholeNumber = useRef(generateRandomNumber()); // Initialize with a random number
  const [count, setCount] =  useState(1);
  const [clickedBoxes, setClickedBoxes] = useState(new Set()); // Track clicked boxes
  const [bombPosition, setBombPosition] = useState(null); // Track the position of the bomb
  const [pathData, setPathData] = useState({});
  const [gameReset, setGameReset] = useState(false); // Flag to reset the game

  useEffect(() => {
    console.log("Random Number:", randomWholeNumber.current);
  }, []);

  useEffect(() => {
    if (gameReset) {
      // Reset the game state
      const resetGame = async () => {
        try {
          const res = await fetch('/api/sendData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pathData, // Send the pathData object
            }),
          });

          if (res.ok) {
            console.log('Data sent successfully');
          } else {
            console.error('Failed to send data');
          }
        } catch (err) {
          console.error('Error:', err);
        } finally {
          // Reset the game state after sending data
          setClickedBoxes(new Set()); 
          setCount(1); // Reset count
          setBombPosition(null); // Clear bomb position
          setPathData({}); // Clear path data
          randomWholeNumber.current = generateRandomNumber(); // Generate a new random number
          setGameReset(false); // Reset flag
        }
      };

      resetGame();
    }
  }, [gameReset]);

  function generateRandomNumber() {
    return Math.ceil(Math.random() * (25 - 1)) + 1;
  }

  async function getData(index) {
    // Update pathData
    setPathData(prevPathData => ({
      ...prevPathData,
      [count]: index
    }));

    // Update clickedBoxes
    setClickedBoxes(prevClickedBoxes => {
      const newClickedBoxes = new Set(prevClickedBoxes).add(index);
      // Check if the index matches the random number
      if (index === randomWholeNumber.current) {
        // Show confirmation dialog
        if (window.confirm("You found the match! Do you want to start a new game?")) {
          setBombPosition(index);
          setGameReset(true); // Set flag to trigger game reset
        }
      }
      return newClickedBoxes;
    });

    // Increment count for the next click
    setCount(prevCount => prevCount + 1);
  }

  // Format pathData for display
  const formattedPathData = Object.entries(pathData)
    .map(([key, value]) => `${key}:${value}`)
    .join(', ');

  return (
    <>
      <div className="w-full h-10 bg-[#1a2b37] border-b-2 border-gray-900 shadow-black shadow-lg">
        <p className="text-white text-center">Path Traced: {formattedPathData}</p>
      </div>
      <div className="w-full h-screen flex justify-center bg-[#1a2b37]">
        <div className="flex flex-row justify-center gap-4">
          <div className="w-fit bg-[#0f212e] h-fit p-2 gap-2 flex flex-col">
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <section key={rowIndex} className="flex flex-row gap-2 justify-center">
                {Array.from({ length: 5 }, (_, colIndex) => {
                  const index = rowIndex * 5 + colIndex + 1; // Calculate the index based on row and column
                  return (
                    <div
                      key={index}
                      onClick={() => getData(index)}
                      className={`w-20 active:scale-95 flex justify-center active:bg-[#3a4a57] rounded-md hover:bg-[#557086] transition-colors duration-100 hover:scale-110 border-b-8 border-[#243949] h-20 bg-[#2f4553] ${clickedBoxes.has(index) ? "bg-[#3a4a57]" : ""}`}
                    >
                      {clickedBoxes.has(index) && index === randomWholeNumber.current ? (
                        <GiRollingBomb className="text-red-600 text-5xl self-center shadow-inner shadow-red-500 rounded-full" />
                      ) : clickedBoxes.has(index) && index !== randomWholeNumber.current ? (
                        <LiaGem className="text-green-500 text-5xl self-center shadow-inner shadow-green-500 rounded-full" />
                      ) : null}
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
