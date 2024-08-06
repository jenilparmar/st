import React, { useState, useCallback, useEffect } from "react";
import { IoDiamond } from "react-icons/io5";
import { GiRollingBomb } from "react-icons/gi";
import debounce from "lodash.debounce";

const Tycoon = () => {
  const [button, setButton] = useState(false);
  const [betAmount, setBetAmount] = useState(5);
  const [totalAmount, setTotalAmount] = useState(50);
  const [move, setMove] = useState(1);
  const [idx, setIdx] = useState({});
  const [winAmount, setWinAmount] = useState(betAmount);
  const [multi, setMulti] = useState(0.1);
  const [prevTotal, setPrevTotal] = useState(totalAmount);
  const [load, setLoad] = useState(false);
  const [win, setWin] = useState(false);
  const [randomNumber, setRandomNumber] = useState(
    Math.floor(Math.random() * 25 + 1)
  );
  const [bombIndex, setBombIndex] = useState(null);

  useEffect(() => {
    if (!button) setWinAmount(betAmount);
  }, [betAmount]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getPrediction = async (index) => {
    if (index === randomNumber) {
      if (Object.keys(idx).length === 24) {
        setTotalAmount(winAmount);
        setButton(false);
        setWin(true);
        await delay(3000);
        setWin(false);
        setBombIndex(index);
        return;
      }
      setBombIndex(index);
      setTotalAmount(prevTotal);
      setButton(false);
      setLoad(true);
      await delay(3000);
      setLoad(false);
      const res = await fetch("/api/sendData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: { [move]: index } }),
      });

      if (res.ok) {
        console.log("Data sent successfully");
      } else {
        console.error("Failed to send data");
      }
      setMove(1);
      setIdx({});
      setWinAmount(betAmount);
      setBombIndex(null);
      return;
    }
    setIdx((prev) => ({ ...prev, [index]: true }));

    const res = await fetch("http://127.0.0.1:8080/Model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ move: parseInt(move) + 1 }),
    });

    const data = await res.json();
    const predicatedIndex = data["prediction"];

    if (!idx[predicatedIndex]) {
      setRandomNumber(predicatedIndex);
    } else {
      let newRandomNumber;
      do {
        newRandomNumber = Math.floor(Math.random() * 25 + 1);
      } while (idx[newRandomNumber]);
      setRandomNumber(newRandomNumber);
    }
    setWinAmount((prev) => parseInt(prev * multi + prev));
    setMulti((prev) => prev + 0.00002);
    setMove((prev) => prev + 1);
    setTotalAmount((prev) => parseInt(prev + winAmount * multi));
  };

  const debouncedGetPrediction = useCallback(debounce(getPrediction, 300), [
    move,
    idx,
    randomNumber,
  ]);

  return (
    <div className="w-full h-screen flex justify-center bg-[#1a2b37]">
      <div className="flex flex-col md:flex-row justify-start mt-10 gap-4">
        <div className="flex flex-row md:flex-col md:justify-center md:gap-4 justify-between px-7">
          <div className="text-green-500 text-2xl font-bold text-nowrap self-center">
            Mines Tycoon
          </div>
          <section className="w-fit self-center text-green-500 font-semibold border-2 border-gray-700 rounded-lg px-2 py-2 text-nowrap bg-[#0f212e]">
            Total Money :- {totalAmount}$
          </section>
        </div>
        <div
          className={`w-fit bg-[#0f212e] ${
            load ? "bg-red-500 shadow-2xl shadow-red-600" : undefined
          }  ${
            win ? "bg-green-500 shadow-2xl shadow-green-600" : undefined
          }rounded-lg h-fit self-center px-2 p-2 gap-2 flex flex-col`}>
          {Array.from({ length: 5 }, (_, rowIndex) => (
            <section
              key={rowIndex}
              className="flex flex-row gap-2 justify-center">
              {Array.from({ length: 5 }, (_, colIndex) => {
                const index = rowIndex * 5 + colIndex + 1;
                return (
                  <div
                    key={index}
                    className={`w-14 md:w-20 md:h-20 active:scale-95 hover:border-green-500 flex justify-center active:bg-[#3a4a57] rounded-md hover:bg-[#557086] transition-colors duration-100 hover:scale-110 border-b-8 ${
                      index === bombIndex
                        ? "bg-black shadow-md shadow-red-500 active:scale-100 hover:scale-100 hover:border-red-500 transition-colors duration-100"
                        : "bg-[#2f4553]"
                    } border-[#243949] h-14`}
                    onClick={() =>
                      button &&
                      bombIndex === null &&
                      !idx[index] &&
                      debouncedGetPrediction(index)
                    }>
                    {idx[index] && bombIndex === null ? (
                      <IoDiamond className="self-center text-3xl text-green-400 rounded-full" />
                    ) : null}
                    {index === bombIndex ? (
                      <GiRollingBomb className="self-center text-4xl text-red-600 decoration-purple-800 shadow-red-500 rounded-full" />
                    ) : null}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
        <div className="md:flex flex-col md:mt-5 w-full">
          <section className="flex flex-row px-2 gap-2 md:gap-8">
            <div className="w-screen px-8 md:px-0 mb-2 md:w-full">
              <p className="text-gray-600 text-nowrap">Win Amount</p>
              <div className="py-2 font-medium bg-[#0f212e] text-green-500 border-2 rounded-lg border-gray-700 text-center w-full">
                {winAmount}$
              </div>
            </div>
            <div className="w-screen px-8 md:px-0 mb-2 md:w-full">
              <p className="text-gray-600 text-nowrap">Bet Amount</p>
              <div className="py-2 font-medium bg-[#0f212e] text-green-500 border-2 rounded-lg border-gray-700 text-center w-full">
                {betAmount}$
              </div>
            </div>
          </section>
          <div className="md:mt-2 flex flex-row justify-around gap-2">
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 5 >= 0 && setBetAmount(5)
              }>
              5$
            </div>
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 10 >= 0 && setBetAmount(10)
              }>
              10$
            </div>
          </div>
          <div className="md:mt-2 my-2 flex flex-row justify-around gap-2">
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 20 >= 0 && setBetAmount(20)
              }>
              20$
            </div>
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 25 >= 0 && setBetAmount(25)
              }>
              25$
            </div>
          </div>
          <div className="md:mt-2 my-2 flex flex-row justify-around gap-2">
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 50 >= 0 && setBetAmount(50)
              }>
              50$
            </div>
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 100 >= 0 && setBetAmount(100)
              }>
              100$
            </div>
          </div>
          <div className="md:mt-2 my-2 flex flex-row justify-around gap-2">
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 200 >= 0 && setBetAmount(200)
              }>
              200$
            </div>
            <div
              className="w-28 md:w-20 px-8 text-center font-medium rounded-lg border-2 border-gray-700 py-2 text-green-500 active:scale-95 active:bg-[#0f252e] hover:border-green-500 cursor-pointer active:border-green-500 bg-[#0f212e]"
              onClick={() =>
                !button && totalAmount - 250 >= 0 && setBetAmount(250)
              }>
              250$
            </div>
          </div>
          <center>
            <button
              className="bg-green-500 md:w-full w-9/12 self-center py-4 mt-4 md:py-0 md:h-10 md:text-center md:self-center md:mt-10 rounded-sm text-xl font-bold active:scale-95 active:bg-green-600 transition-all duration-100"
              onClick={() => {
                if (totalAmount - betAmount >= 0) setButton(true);
                setPrevTotal(totalAmount - betAmount);
                if (button) {
                  setTotalAmount(prevTotal + winAmount);
                  setWinAmount(betAmount);
                  setMove(1);
                  setIdx({});
                  setBombIndex(null);
                  setButton(false);
                }
              }}>
              {button ? "CashOut" : "Bet"}
            </button>
          </center>
        </div>
      </div>
    </div>
  );
};

export default Tycoon;
