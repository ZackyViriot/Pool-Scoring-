import React, { useState, useEffect } from "react";

export default function PoolScoringComponent() {
    const [gameStarted, setGameStarted] = useState(false);
    const [objectBallsOnTable, setObjectBallsOnTable] = useState(15);
    const [activePlayer, setActivePlayer] = useState(1); // 1 or 2
    const [targetGoal, setTargetGoal] = useState(125);
    const [gameTime, setGameTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    
    const [player1, setPlayer1] = useState({
        name: "",
        score: 0,
        handicap: 0,
        high: 0,
        safes: 0,
        misses: 0,
        currentRun: 0
    });

    const [player2, setPlayer2] = useState({
        name: "",
        score: 0,
        handicap: 0,
        high: 0,
        safes: 0,
        misses: 0,
        currentRun: 0
    });

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setGameTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        const pad = (num) => num.toString().padStart(2, '0');
        
        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
        }
        return `${pad(minutes)}:${pad(remainingSeconds)}`;
    };

    const adjustScore = (playerNum, amount) => {
        const player = playerNum === 1 ? player1 : player2;
        const setPlayer = playerNum === 1 ? setPlayer1 : setPlayer2;
        
        const newScore = player.score + amount;
        
        setPlayer({
            ...player,
            score: newScore,
            currentRun: amount > 0 ? player.currentRun + 1 : 0,
            high: amount > 0 ? Math.max(player.high, player.currentRun + 1) : player.high
        });

        if (amount > 0) {
            setObjectBallsOnTable(prev => {
                const newCount = prev - 1;
                if (newCount === 0) {
                    return 15;
                }
                return newCount;
            });
        }
    };

    const handleSafe = (playerNum) => {
        const player = playerNum === 1 ? player1 : player2;
        const setPlayer = playerNum === 1 ? setPlayer1 : setPlayer2;
        
        setPlayer({
            ...player,
            safes: player.safes + 1,
            currentRun: 0
        });
        
        setActivePlayer(playerNum === 1 ? 2 : 1);
    };

    const handleMiss = (playerNum) => {
        const player = playerNum === 1 ? player1 : player2;
        const setPlayer = playerNum === 1 ? setPlayer1 : setPlayer2;
        
        setPlayer({
            ...player,
            misses: player.misses + 1,
            currentRun: 0
        });
        
        setActivePlayer(playerNum === 1 ? 2 : 1);
    };

    const startGame = () => {
        setGameStarted(true);
        setObjectBallsOnTable(15);
        setActivePlayer(1);
        setIsTimerRunning(true);
        setGameTime(0);
        // Apply handicaps to initial scores
        setPlayer1(prev => ({
            ...prev,
            score: Number(prev.handicap)
        }));
        setPlayer2(prev => ({
            ...prev,
            score: Number(prev.handicap)
        }));
    };

    const endGame = () => {
        setGameStarted(false);
        setIsTimerRunning(false);
        setPlayer1(prev => ({
            ...prev,
            score: 0,
            high: 0,
            safes: 0,
            misses: 0,
            currentRun: 0
        }));
        setPlayer2(prev => ({
            ...prev,
            score: 0,
            high: 0,
            safes: 0,
            misses: 0,
            currentRun: 0
        }));
    };

    const newRack = () => {
        setObjectBallsOnTable(15);
    };

    return (
        <div className="bg-black text-white min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* Player 1 */}
                    <div>
                        <input
                            type="text"
                            placeholder="Player 1 Name"
                            className="w-full bg-black border border-gray-700 rounded-lg p-2 text-2xl text-white mb-4"
                            value={player1.name}
                            onChange={(e) => setPlayer1({...player1, name: e.target.value})}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xl">Handicap:</span>
                            <input
                                type="number"
                                className="w-20 bg-black border border-gray-700 rounded p-1 text-xl"
                                value={player1.handicap}
                                onChange={(e) => setPlayer1({...player1, handicap: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* Center Goal Section */}
                    <div className="text-center">
                        <div className="flex justify-center items-center mb-2">
                            <span className="text-2xl">Goal</span>
                            <button className="ml-2 text-blue-400 text-xl">ⓘ</button>
                        </div>
                        <input
                            type="number"
                            className="w-32 bg-black border border-gray-700 rounded text-center text-6xl font-bold mb-4"
                            value={targetGoal}
                            onChange={(e) => setTargetGoal(Number(e.target.value))}
                        />
                        {gameStarted && (
                            <div className="text-xl text-gray-400 mb-4">
                                {formatTime(gameTime)}
                            </div>
                        )}
                        <div className="text-xl mb-4">{objectBallsOnTable} object balls on table</div>
                        <button 
                            onClick={newRack}
                            className="text-gray-400 text-xl mb-2 hover:text-white"
                        >
                            New Rack
                        </button>
                        <button 
                            onClick={gameStarted ? endGame : startGame}
                            className={`text-xl block w-full mb-2 ${gameStarted ? 'text-gray-400' : 'text-blue-400'}`}
                        >
                            {gameStarted ? 'End' : 'Start'}
                        </button>
                    </div>

                    {/* Player 2 */}
                    <div>
                        <input
                            type="text"
                            placeholder="Player 2 Name"
                            className="w-full bg-black border border-gray-700 rounded-lg p-2 text-2xl text-white mb-4"
                            value={player2.name}
                            onChange={(e) => setPlayer2({...player2, name: e.target.value})}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xl">Handicap:</span>
                            <input
                                type="number"
                                className="w-20 bg-black border border-gray-700 rounded p-1 text-xl"
                                value={player2.handicap}
                                onChange={(e) => setPlayer2({...player2, handicap: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>

                {/* Scores and Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Player 1 Stats */}
                    <div className="space-y-4">
                        <div className="text-8xl font-bold text-center">
                            <div 
                                className={`${activePlayer === 1 ? 'text-red-500' : 'text-gray-500'}`}
                            >
                                {player1.score}
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                <button 
                                    onClick={() => gameStarted && adjustScore(1, -1)}
                                    className="text-4xl text-gray-400 hover:text-white focus:outline-none"
                                >
                                    −
                                </button>
                                <button 
                                    onClick={() => gameStarted && adjustScore(1, 1)}
                                    className="text-4xl text-gray-400 hover:text-white focus:outline-none"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="text-4xl text-blue-400">
                            <div>{player1.currentRun}</div>
                            <div 
                                className="text-xl cursor-pointer hover:text-blue-300"
                                onClick={() => gameStarted && handleSafe(1)}
                            >
                                Safe
                            </div>
                            <div 
                                className="text-xl cursor-pointer hover:text-blue-300"
                                onClick={() => gameStarted && handleMiss(1)}
                            >
                                Miss
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>High:</span>
                                <span>{player1.high}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Safes:</span>
                                <span>{player1.safes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Misses:</span>
                                <span>{player1.misses}</span>
                            </div>
                        </div>
                    </div>

                    {/* Center Space */}
                    <div></div>

                    {/* Player 2 Stats */}
                    <div className="space-y-4">
                        <div className="text-8xl font-bold text-center">
                            <div 
                                className={`${activePlayer === 2 ? 'text-red-500' : 'text-gray-500'}`}
                            >
                                {player2.score}
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                <button 
                                    onClick={() => gameStarted && adjustScore(2, -1)}
                                    className="text-4xl text-gray-400 hover:text-white focus:outline-none"
                                >
                                    −
                                </button>
                                <button 
                                    onClick={() => gameStarted && adjustScore(2, 1)}
                                    className="text-4xl text-gray-400 hover:text-white focus:outline-none"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="text-4xl text-orange-400">
                            <div>{player2.currentRun}</div>
                            <div 
                                className="text-xl cursor-pointer hover:text-orange-300"
                                onClick={() => gameStarted && handleSafe(2)}
                            >
                                Safe
                            </div>
                            <div 
                                className="text-xl cursor-pointer hover:text-orange-300"
                                onClick={() => gameStarted && handleMiss(2)}
                            >
                                Miss
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>High:</span>
                                <span>{player2.high}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Safes:</span>
                                <span>{player2.safes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Misses:</span>
                                <span>{player2.misses}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}