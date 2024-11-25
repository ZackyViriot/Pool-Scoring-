import React, { useState, useEffect } from "react";
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function PoolScoringComponent() {
    // Game state
    const [gameStarted, setGameStarted] = useState(false);
    const [objectBallsOnTable, setObjectBallsOnTable] = useState(15);
    const [activePlayer, setActivePlayer] = useState(1);
    const [targetGoal, setTargetGoal] = useState(125);
    const [gameTime, setGameTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    
    // Win modal state
    const [showWinModal, setShowWinModal] = useState(false);
    const [winner, setWinner] = useState(null);
    const [winnerStats, setWinnerStats] = useState(null);

    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return true;
    });

    // Window size for confetti
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    // Sound effects
    const [playWinSound] = useSound('/sounds/win.mp3');

    // Player states
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

    // Theme effect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDarkMode]);

    // Window size effect
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Game timer effect
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

    const calculateStats = (player) => {
        const totalShots = player.misses + player.safes + player.high;
        const accuracy = totalShots ? ((totalShots - player.misses) / totalShots * 100).toFixed(1) : 0;
        const avgPointsPerInning = player.score / (player.misses + player.safes + 1);
        
        return {
            accuracy: accuracy,
            avgPointsPerInning: avgPointsPerInning.toFixed(1),
            totalShots: totalShots,
            foulsPerGame: player.fouls
        };
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

        if (newScore >= targetGoal) {
            const stats = calculateStats(player);
            setWinner(player.name || `Player ${playerNum}`);
            setWinnerStats(stats);
            setShowWinModal(true);
            setIsTimerRunning(false);
            playWinSound();
        }

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

    const closeWinModal = () => {
        setShowWinModal(false);
        setWinner(null);
        setWinnerStats(null);
        endGame();
    };

    const newRack = () => {
        setObjectBallsOnTable(15);
    };
    return (
        <div className={`min-h-screen transition-colors duration-200
            ${isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 to-black text-white' 
                : 'bg-gradient-to-br from-blue-50 to-white text-gray-900'}`}>
            
            {/* Theme Toggle */}
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="fixed top-4 right-4 p-2 rounded-full transition-all duration-200
                    hover:scale-110 transform z-50 shadow-lg
                    dark:bg-gray-800 bg-white"
                aria-label="Toggle theme"
            >
                {isDarkMode ? (
                    <SunIcon className="w-6 h-6 text-yellow-400" />
                ) : (
                    <MoonIcon className="w-6 h-6 text-gray-700" />
                )}
            </button>

            <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
                {/* Header Section */}
                <div className={`rounded-xl p-4 md:p-6 mb-4 md:mb-8 transition-colors duration-200
                    ${isDarkMode 
                        ? 'bg-black/30 backdrop-blur-sm border border-white/10' 
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg'}`}>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {/* Player 1 Info */}
                        <div className="space-y-2 md:space-y-4">
                            <input
                                type="text"
                                placeholder="Player 1"
                                className={`w-full bg-transparent border-b text-xl md:text-2xl font-medium 
                                    focus:outline-none transition-colors duration-200
                                    ${isDarkMode 
                                        ? 'border-blue-500 focus:border-blue-400' 
                                        : 'border-blue-600 focus:border-blue-500'}`}
                                value={player1.name}
                                onChange={(e) => setPlayer1({...player1, name: e.target.value})}
                            />
                            <div className="flex items-center gap-2 md:gap-4">
                                <span className={`text-sm md:text-base
                                    ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Handicap
                                </span>
                                <input
                                    type="number"
                                    className={`w-16 md:w-20 bg-transparent border-b text-lg md:text-xl 
                                        text-center focus:outline-none transition-colors duration-200
                                        ${isDarkMode 
                                            ? 'border-blue-500 focus:border-blue-400' 
                                            : 'border-blue-600 focus:border-blue-500'}`}
                                    value={player1.handicap}
                                    onChange={(e) => setPlayer1({...player1, handicap: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        {/* Game Controls */}
                        <div className="text-center space-y-2 md:space-y-4">
                            <div className="relative">
                                <input
                                    type="number"
                                    className={`w-32 md:w-40 bg-transparent border-b-2 text-4xl md:text-5xl 
                                        font-bold text-center focus:outline-none transition-colors duration-200
                                        ${isDarkMode 
                                            ? 'border-purple-500' 
                                            : 'border-purple-600'}`}
                                    value={targetGoal}
                                    onChange={(e) => setTargetGoal(Number(e.target.value))}
                                />
                                <div className={`text-xs md:text-sm mt-1
                                    ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                    TARGET SCORE
                                </div>
                            </div>
                            
                            {gameStarted && (
                                <div className={`text-xl md:text-2xl font-mono
                                    ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {formatTime(gameTime)}
                                </div>
                            )}
                            
                            <div className="flex justify-center gap-2 md:gap-4">
                                <button 
                                    onClick={gameStarted ? endGame : startGame}
                                    className={`px-4 md:px-6 py-1 md:py-2 rounded-full text-sm md:text-base 
                                        transition-colors duration-200 ${
                                        gameStarted 
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    }`}
                                >
                                    {gameStarted ? 'End Game' : 'Start Game'}
                                </button>
                                
                                <button 
                                    onClick={newRack}
                                    className="px-4 md:px-6 py-1 md:py-2 rounded-full 
                                        bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                        transition-colors duration-200 text-sm md:text-base"
                                >
                                    New Rack ({objectBallsOnTable})
                                </button>
                            </div>
                        </div>

                        {/* Player 2 Info */}
                        <div className="space-y-2 md:space-y-4">
                            <input
                                type="text"
                                placeholder="Player 2"
                                className={`w-full bg-transparent border-b text-xl md:text-2xl 
                                    font-medium focus:outline-none transition-colors duration-200
                                    ${isDarkMode 
                                        ? 'border-orange-500 focus:border-orange-400' 
                                        : 'border-orange-600 focus:border-orange-500'}`}
                                value={player2.name}
                                onChange={(e) => setPlayer2({...player2, name: e.target.value})}
                            />
                            <div className="flex items-center gap-2 md:gap-4">
                                <span className={`text-sm md:text-base
                                    ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Handicap
                                </span>
                                <input
                                    type="number"
                                    className={`w-16 md:w-20 bg-transparent border-b text-lg md:text-xl 
                                        text-center focus:outline-none transition-colors duration-200
                                        ${isDarkMode 
                                            ? 'border-orange-500 focus:border-orange-400' 
                                            : 'border-orange-600 focus:border-orange-500'}`}
                                    value={player2.handicap}
                                    onChange={(e) => setPlayer2({...player2, handicap: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scoring Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {/* Player 1 Score */}
                    <div className={`rounded-xl p-4 md:p-8 transition-colors duration-200
                        ${isDarkMode 
                            ? 'bg-black/30 backdrop-blur-sm border border-white/10' 
                            : 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg'}
                        ${activePlayer === 1 ? 'ring-2 ring-blue-500/50 animate-pulse' : ''}`}>
                        
                        <div className="text-center mb-4 md:mb-8">
                            <div className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold
                                ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {player1.score}
                            </div>
                            <div className="flex justify-center gap-4 mt-4">
                                <button 
                                    onClick={() => gameStarted && adjustScore(1, -1)}
                                    className="text-2xl md:text-4xl text-gray-400 hover:text-white 
                                        w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-800/50 
                                        flex items-center justify-center transition-colors"
                                >
                                    −
                                </button>
                                <button 
                                    onClick={() => gameStarted && adjustScore(1, 1)}
                                    className="text-2xl md:text-4xl text-gray-400 hover:text-white 
                                        w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-800/50 
                                        flex items-center justify-center transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                            <div className="bg-black/20 rounded-lg p-3 md:p-4 text-center">
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {player1.currentRun}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Current Run</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 md:p-4 text-center">
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {player1.high}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">High Run</div>
                            </div>
                            <button 
                                onClick={() => gameStarted && handleSafe(1)}
                                className="bg-black/20 rounded-lg p-3 md:p-4 text-center 
                                    hover:bg-blue-500/10 transition-colors"
                            >
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {player1.safes}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Safes</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleMiss(1)}
                                className="bg-black/20 rounded-lg p-3 md:p-4 text-center 
                                    hover:bg-blue-500/10 transition-colors"
                            >
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {player1.misses}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Misses</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleFoul(1)}
                                className="bg-black/20 rounded-lg p-3 md:p-4 text-center 
                                    hover:bg-red-500/10 transition-colors col-span-2"
                            >
                                <div className="text-2xl md:text-3xl text-red-400">
                                    {player1.fouls}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Fouls</div>
                            </button>
                        </div>
                    </div>

                    {/* Player 2 Score */}
                    <div className={`rounded-xl p-4 md:p-8 transition-colors duration-200
                        ${isDarkMode 
                            ? 'bg-black/30 backdrop-blur-sm border border-white/10' 
                            : 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg'}
                        ${activePlayer === 2 ? 'ring-2 ring-orange-500/50 animate-pulse' : ''}`}>
                        
                        <div className="text-center mb-4 md:mb-8">
                            <div className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold
                                ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                {player2.score}
                            </div>
                            <div className="flex justify-center gap-4 mt-4">
                                <button 
                                    onClick={() => gameStarted && adjustScore(2, -1)}
                                    className="text-2xl md:text-4xl text-gray-400 hover:text-white 
                                        w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-800/50 
                                        flex items-center justify-center transition-colors"
                                >
                                    −
                                </button>
                                <button 
                                    onClick={() => gameStarted && adjustScore(2, 1)}
                                    className="text-2xl md:text-4xl text-gray-400 hover:text-white 
                                        w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-800/50 
                                        flex items-center justify-center transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                            <div className="bg-black/20 rounded-lg p-3 md:p-4 text-center">
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {player2.currentRun}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Current Run</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 md:p-4 text-center">
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {player2.high}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">High Run</div>
                            </div>
                            <button 
                                onClick={() => gameStarted && handleSafe(2)}
                                className="bg-black/20 rounded-lg p-3 md:p-4 text-center 
                                    hover:bg-orange-500/10 transition-colors"
                            >
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {player2.safes}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Safes</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleMiss(2)}
                                className="bg-black/20 rounded-lg p-3 md:p-4 text-center 
                                    hover:bg-orange-500/10 transition-colors"
                            >
                                <div className={`text-2xl md:text-3xl
                                    ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {player2.misses}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Misses</div>
                            </button>
                            <button 
                                onClick={() => gameStarted && handleFoul(2)}
                                className="bg-black/20 rounded-lg p-3 md:p-4 text-center 
                                    hover:bg-red-500/10 transition-colors col-span-2"
                            >
                                <div className="text-2xl md:text-3xl text-red-400">
                                    {player2.fouls}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Fouls</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Win Modal */}
                {showWinModal && (
                    <>
                        <Confetti
                            width={windowSize.width}
                            height={windowSize.height}
                            numberOfPieces={200}
                            recycle={false}
                            colors={['#60A5FA', '#34D399', '#F87171', '#FBBF24']}
                        />
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm 
                            flex items-center justify-center z-50">
                            <div className={`rounded-xl p-8 max-w-md mx-4 text-center 
                                shadow-2xl animate-fadeIn transition-colors duration-200
                                ${isDarkMode 
                                    ? 'bg-gradient-to-b from-gray-800 to-gray-900 border border-white/10' 
                                    : 'bg-gradient-to-b from-white to-gray-50 border border-gray-200'}`}>
                                
                                <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4">
                                    🏆 Winner! 🏆
                                </h2>
                                <p className="text-2xl md:text-3xl font-medium mb-6">
                                    {winner}
                                </p>
                                <div className="space-y-3">
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Final Score: {winner === (player1.name || 'Player 1') ? player1.score : player2.score}
                                    </p>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Game Time: {formatTime(gameTime)}
                                    </p>
                                    {winnerStats && (
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div className="bg-black/20 rounded-lg p-3">
                                                <div className="text-xl text-purple-400">
                                                    {winnerStats.accuracy}%
                                                </div>
                                                <div className="text-sm text-gray-400">Accuracy</div>
                                            </div>
                                            <div className="bg-black/20 rounded-lg p-3">
                                                <div className="text-xl text-purple-400">
                                                    {winnerStats.avgPointsPerInning}
                                                </div>
                                                <div className="text-sm text-gray-400">Avg Points/Inning</div>
                                            </div>
                                            <div className="bg-black/20 rounded-lg p-3">
                                                <div className="text-xl text-purple-400">
                                                    {winnerStats.totalShots}
                                                </div>
                                                <div className="text-sm text-gray-400">Total Shots</div>
                                            </div>
                                            <div className="bg-black/20 rounded-lg p-3">
                                                <div className="text-xl text-purple-400">
                                                    {winnerStats.foulsPerGame}
                                                </div>
                                                <div className="text-sm text-gray-400">Total Fouls</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={closeWinModal}
                                    className="mt-8 px-8 py-3 bg-purple-500/20 hover:bg-purple-500/30 
                                        text-purple-300 rounded-full transition-colors text-lg"
                                >
                                    New Game
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

