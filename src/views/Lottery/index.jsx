import React, { useState, useEffect } from "react";
import { ref, onValue, push, get, child } from "firebase/database";
import { db } from "../../utils/firebase";
import {
  Frame,
  FrameWrapper,
  LotterySect,
  LotteryWrapper,
  RandomImg,
  RandomImgWrapper,
  RollDown,
  RollUp,
  RollWrapper,
} from "../../styles/Lottery";
import ResultFrame from "../../assets/frame.jpg";
import RollUpImg from "../../assets/rollup.gif";
import RollDownImg from "../../assets/rolldown.gif";
import Table from "../Table";

const Lottery = () => {
  const [showImage, setShowImage] = useState(true);
  const [displayImage, setDisplayImage] = useState(false);

  // Existing state variables for random numbers and combined numbers
  const [randomNumber1, setRandomNumber1] = useState(null);
  const [randomNumber2, setRandomNumber2] = useState(null);
  const [randomNumber3, setRandomNumber3] = useState(null);
  const [randomNumber4, setRandomNumber4] = useState(null);
  const [combinedNumber1, setCombinedNumber1] = useState(null);
  const [combinedNumber2, setCombinedNumber2] = useState(null);
  // State to hold fetched data from Firebase
  const [firebaseData, setFirebaseData] = useState({
    allRandomNumbers1: [],
    allRandomNumbers2: [],
  });

  const fetchDataFromFirebase = () => {
    try {
      const unsubscribe1 = onValue(ref(db, "allRandomNumbers1"), (snapshot) => {
        if (snapshot.exists()) {
          const allRandomNumbers1 = Object.values(snapshot.val());
          setFirebaseData((prevData) => ({
            ...prevData,
            allRandomNumbers1,
          }));
        }
      });

      const unsubscribe2 = onValue(ref(db, "allRandomNumbers2"), (snapshot) => {
        if (snapshot.exists()) {
          const allRandomNumbers2 = Object.values(snapshot.val());
          setFirebaseData((prevData) => ({
            ...prevData,
            allRandomNumbers2,
          }));
        }
      });

      return () => {
        // Clean up the subscriptions when the component unmounts
        unsubscribe1();
        unsubscribe2();
      };
    } catch (error) {
      console.error("Error fetching data from the database:", error);
    }
  };

  // Function to generate a new random number between 0 and 9
  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10);
  };

  // Function to combine two numbers into a single number
  const combineNumbers = (num1, num2) => {
    const combinedString = num1.toString() + num2.toString();
    return parseInt(combinedString, 10); // Convert the combined string back to a number
  };

  // Function to split the combined number into two digits
  const splitCombinedNumber = (number) => {
    const digit1 = Math.floor(number / 10);
    const digit2 = number % 10;
    return { digit1, digit2 };
  };

  // Function to push the new combined number with timestamp to the Firebase database
  const pushCombinedNumber1ToDB = (number) => {
    try {
      const timestamp = new Date().toISOString();
      const time = new Date().toLocaleTimeString();
      const date = new Date().toLocaleDateString(); // Get the current date as a string
      push(ref(db, "allRandomNumbers1"), { number, timestamp, time, date });
    } catch (error) {
      console.error("Error pushing combined number 1 to the database:", error);
    }
  };
  const setLastGeneratedTime = (time) => {
    // Implement the logic to save the time to the database or do other actions if needed.
    console.log("Last generated time:", time);
  };

  // Function to push the new combined number with timestamp to the Firebase database
  const pushCombinedNumber2ToDB = (number) => {
    try {
      const timestamp = new Date().toISOString();
      const time = new Date().toLocaleTimeString();
      const date = new Date().toLocaleDateString(); // Get the current date as a string
      push(ref(db, "allRandomNumbers2"), { number, timestamp, time, date });
    } catch (error) {
      console.error("Error pushing combined number 2 to the database:", error);
    }
  };

  // Function to fetch the last generated numbers from the Firebase database
  const fetchLastGeneratedNumbersFromDB = async () => {
    try {
      const snapshot1 = await get(ref(db, "allRandomNumbers1"));
      const snapshot2 = await get(ref(db, "allRandomNumbers2"));
      if (snapshot1.exists()) {
        const allRandomNumbers1 = Object.values(snapshot1.val());
        const lastGeneratedNumber1 =
          allRandomNumbers1[allRandomNumbers1.length - 1];
        setCombinedNumber1(lastGeneratedNumber1.number);
        const { digit1, digit2 } = splitCombinedNumber(
          lastGeneratedNumber1.number
        );
        setRandomNumber1(digit1);
        setRandomNumber2(digit2);
      }
      if (snapshot2.exists()) {
        const allRandomNumbers2 = Object.values(snapshot2.val());
        const lastGeneratedNumber2 =
          allRandomNumbers2[allRandomNumbers2.length - 1];
        setCombinedNumber2(lastGeneratedNumber2.number);
        const { digit1, digit2 } = splitCombinedNumber(
          lastGeneratedNumber2.number
        );
        setRandomNumber3(digit1);
        setRandomNumber4(digit2);
      }
    } catch (error) {
      console.error(
        "Error fetching combined numbers from the database:",
        error
      );
    }
  };

  // Function to generate new numbers and combine them
  const generateNewNumbers = () => {
    const now = new Date();

    // Stop generating numbers after 18:25 (6:25 PM)
    if (now.getHours() === 13 && now.getMinutes() >= 44) {
      console.log("Generatingnumbers stopped.");
      return; // Exit the function and stop generating numbers
    }
    const newRandomNumber1 = generateRandomNumber();
    const newRandomNumber2 = generateRandomNumber();
    const newRandomNumber3 = generateRandomNumber();
    const newRandomNumber4 = generateRandomNumber();

    // Stop generating numbers after 18:25 (6:25 PM)

    setRandomNumber1(newRandomNumber1);
    setRandomNumber2(newRandomNumber2);
    setRandomNumber3(newRandomNumber3);
    setRandomNumber4(newRandomNumber4);

    const newCombinedNumber1 = combineNumbers(
      newRandomNumber1,
      newRandomNumber2
    );
    const newCombinedNumber2 = combineNumbers(
      newRandomNumber3,
      newRandomNumber4
    );

    if (newCombinedNumber1 === newCombinedNumber2) {
      // If they are the same, generate new numbers again
      return generateNewNumbers();
    } else {
      // If they are different, update the combined numbers in the database
      pushCombinedNumber1ToDB(newCombinedNumber1);
      pushCombinedNumber2ToDB(newCombinedNumber2);
    }
    // Save the current time as the last generated time
    setLastGeneratedTime(new Date().getTime());
  };

  useEffect(() => {
    // Fetch the last generated numbers from the database
    fetchLastGeneratedNumbersFromDB();
    fetchDataFromFirebase();

    // Set up the interval to generate new numbers every 1 minute
    const interval = setInterval(() => {
      generateNewNumbers();
    }, 10000); // Change this value to 60000 for 1 minute

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // This effect will run once when the component mounts
    // Set a timer to hide the image after 3-4 seconds
    const timer = setTimeout(() => {
      setShowImage(false);
    }, 2000); // Change this value to 4000 for 4 seconds

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const showImageAfterDelay = () => {
    setTimeout(() => {
      setDisplayImage(true); // Show the random number images
      setShowImage(false); // Hide the RollUp and RollDown images
    }, 2000); // Change this value to adjust the delay (in milliseconds)
  };

  // Call the function to start the timer when the component mounts
  useEffect(() => {
    showImageAfterDelay();
  }, []);

  return (
    <LotterySect>
      <LotteryWrapper>
        <FrameWrapper>
          <Frame src={ResultFrame} />
          {showImage && (
            <RollWrapper>
              <RollUp src={RollUpImg} />
              <RollDown src={RollDownImg} />
              <RollUp src={RollUpImg} />
              <RollDown src={RollDownImg} />
            </RollWrapper>
          )}

          {displayImage && (
            <RandomImgWrapper>
              {/* Display the first digit of the combined number 1 as an image */}
              {randomNumber1 !== null &&
              randomNumber1 >= 0 &&
              randomNumber1 <= 9 ? (
                <RandomImg
                  src={require(`../../assets/${randomNumber1}.png`)}
                  alt={`Random Number ${randomNumber1}`}
                />
              ) : (
                <p>Image not found</p>
              )}

              {/* Display the second digit of the combined number 1 as an image */}
              {randomNumber2 !== null &&
              randomNumber2 >= 0 &&
              randomNumber2 <= 9 ? (
                <RandomImg
                  src={require(`../../assets/${randomNumber2}.png`)}
                  alt={`Random Number ${randomNumber2}`}
                />
              ) : (
                <p>Image not found</p>
              )}

              {/* Display the first digit of the combined number 2 as an image */}
              {randomNumber3 !== null &&
              randomNumber3 >= 0 &&
              randomNumber3 <= 9 ? (
                <RandomImg
                  src={require(`../../assets/${randomNumber3}.png`)}
                  alt={`Random Number ${randomNumber3}`}
                />
              ) : (
                <p>Image not found</p>
              )}

              {/* Display the second digit of the combined number 2 as an image */}
              {randomNumber4 !== null &&
              randomNumber4 >= 0 &&
              randomNumber4 <= 9 ? (
                <RandomImg
                  src={require(`../../assets/${randomNumber4}.png`)}
                  alt={`Random Number ${randomNumber4}`}
                />
              ) : (
                <p>Image not found</p>
              )}
            </RandomImgWrapper>
          )}
        </FrameWrapper>
      </LotteryWrapper>
      <Table tableData={firebaseData} />
      {/* Display the table component */}
    </LotterySect>
  );
};

export default Lottery;
