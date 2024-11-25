import React, { useState, useEffect } from "react";

export default function PoolScoringComponent() {
    const [gameStarted, setGameStarted] = useState(false);
    const [objectBallsOnTable, setObjectBallsOnTable] = useState(15);
    const [activePlayer, setActivePlayer] = useState(1);
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
        fouls: 0,
        currentRun: 0
    });

    const [player2, setPlayer2] = useState({
        name: "",
        score: 0,
        handicap: 0,
        high: 0,
        safes: 0,
        misses: 0,
        fouls: 0,
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

    const handleFoul = (playerNum) => {
        const player = playerNum === 1 ? player1 : player2;
        const setPlayer = playerNum === 1 ? setPlayer1 : setPlayer2;
        
        setPlayer({
            ...player,
            score: player.score - 1,
            fouls: player.fouls + 1,
            currentRun: 0
        });
        
        setActivePlayer(playerNum === 1 ? 2 : 1);
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
            fouls: 0,
            currentRun: 0
        }));
        setPlayer2(prev => ({
            ...prev,
            score: 0,
            high: 0,
            safes: 0,
            misses: 0,
            fouls: 0,
            currentRun: 0
        }));
    };

    const newRack = () => {
        setObjectBallsOnTable(15);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-3 gap-8">
                        {/* Player 1 Info */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Player 1"
                                className="w-full bg-transparent border-b border-blue-500 text-2xl font-medium focus:outline-none focus:border-blue-400 transition-colors"
                                value={player1.name}
                                onChange={(e) => setPlayer1({...player1, name: e.target.value})}
                            />
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400">Handicap</span>
                                <input
                                    type="number"
                                    className="w-20 bg-transparent border-b border-blue-500 text-xl text-center"
                                    value={player1.handicap}
                                    onChange={(e) => setPlayer1({...player1, handicap: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        {/* Game Controls */}
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-40 bg-transparent border-b-2 border-purple-500 text-5xl font-bold text-center focus:outline-none"
                                    value={targetGoal}
                                    onChange={(e) => setTargetGoal(Number(e.target.value))}
                                />
                                <div className="text-purple-400 text-sm mt-1">TARGET SCORE</div>
                            </div>
                            
                            {gameStarted && (
                                <div className="text-2xl font-mono text-gray-400">
                                    {formatTime(gameTime)}
                                </div>
                            )}
                            
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={gameStarted ? endGame : startGame}
                                    className={`px-6 py-2 rounded-full transition-colors ${
                                        gameStarted 
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    }`}
                                >
                                    {gameStarted ? 'End Game' : 'Start Game'}
                                </button>
                                
                                <button 
                                    onClick={newRack}
                                    className="px-6 py-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                >
                                    New Rack ({objectBallsOnTable})
                                </button>
                            </div>
                        </div>

                        {/* Player 2 Info */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Player 2"
                                className="w-full bg-transparent border-b border-orange-500 text-2xl font-medium focus:outline-none focus:border-orange-400 transition-colors"
                                value={player2.name}
                                onChange={(e) => setPlayer2({...player2, name: e.target.value})}
                            />
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400">Handicap</span>
                                <input
                                    type="number"
                                    className="w-20 bg-transparent border-b border-orange-500 text-xl text-center"
                                    value={player2.handicap}
                                    onChange={(e) => setPlayer2({...player2, handicap: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scoring Section */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Player 1 Score */}
                    <div className={`bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 ${
                        activePlayer === 1 ? 'ring-2 ring-blue-500/50 animate-pulse' : ''
                    }`}>
                        <div className="text-center mb-8">
                            <div className="text-9xl font-bold text-blue-400">
                                {player1.score}
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <button 
                                    onClick={() => gameStarted && adjustScore(1, -1)}
                                    className="text-4xl text-gray-400 hover:text-white w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center transition-colors"
                                >
                                    −
                                </button>
                                <button 
                                    onClick={() => gameStarted && adjustScore(1, 1)}
                                    className="text-4xl text-gray-400 hover:text-white w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 rounded-lg p-4 text-center transform transition-transform hover:-translate-y-1">
                                <div className="text-3xl text-blue-400">{player1.currentRun}</div>
                                <div className="text-sm text-gray-400">Current Run</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-4 text-center transform transition-transform hover:-translate-y-1">
                                <div className="text-3xl text-blue-400">{player1.high}</div>
                                <div className="text-sm text-gray-400">High Run</div>
                            </div>
                            <button 
                                onClick={() => gameStarted && handleSafe(1)}
                                className="bg-black/20 rounded-lg p-4 text-center hover:bg-blue-500/10 transition-colors"
                            >
                                <div className="text-3xl text-blue-400">{player1.safes}</div>
                                <div className="text-sm text-gray-400">Safes</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleMiss(1)}
                                className="bg-black/20 rounded-lg p-4 text-center hover:bg-blue-500/10 transition-colors"
                            >
                                <div className="text-3xl text-blue-400">{player1.misses}</div>
                                <div className="text-sm text-gray-400">Misses</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleFoul(1)}
                                className="bg-black/20 rounded-lg p-4 text-center hover:bg-red-500/10 transition-colors col-span-2"
                            >
                                <div className="text-3xl text-red-400">{player1.fouls}</div>
                                <div className="text-sm text-gray-400">Fouls</div>
                            </button>
                        </div>
                    </div>

                    {/* Player 2 Score */}
                    <div className={`bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 ${
                        activePlayer === 2 ? 'ring-2 ring-orange-500/50 animate-pulse' : ''
                    }`}>
                        <div className="text-center mb-8">
                            <div className="text-9xl font-bold text-orange-400">
                                {player2.score}
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <button 
                                    onClick={() => gameStarted && adjustScore(2, -1)}
                                    className="text-4xl text-gray-400 hover:text-white w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center transition-colors"
                                >
                                    −
                                </button>
                                <button 
                                    onClick={() => gameStarted && adjustScore(2, 1)}
                                    className="text-4xl text-gray-400 hover:text-white w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 rounded-lg p-4 text-center transform transition-transform hover:-translate-y-1">
                                <div className="text-3xl text-orange-400">{player2.currentRun}</div>
                                <div className="text-sm text-gray-400">Current Run</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-4 text-center transform transition-transform hover:-translate-y-1">
                                <div className="text-3xl text-orange-400">{player2.high}</div>
                                <div className="text-sm text-gray-400">High Run</div>
                            </div>
                            <button 
                                onClick={() => gameStarted && handleSafe(2)}
                                className="bg-black/20 rounded-lg p-4 text-center hover:bg-orange-500/10 transition-colors"
                            >
                                <div className="text-3xl text-orange-400">{player2.safes}</div>
                                <div className="text-sm text-gray-400">Safes</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleMiss(2)}
                                className="bg-black/20 rounded-lg p-4 text-center hover:bg-orange-500/10 transition-colors"
                            >
                                <div className="text-3xl text-orange-400">{player2.misses}</div>
                                <div className="text-sm text-gray-400">Misses</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleFoul(2)}
                                className="bg-black/20 rounded-lg p-4 text-center hover:bg-red-500/10 transition-colors col-span-2"
                            >
                                <div className="text-3xl text-red-400">{player2.fouls}</div>
                                <div className="text-sm text-gray-400">Fouls</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}