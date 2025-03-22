"use client";

import { useRef, useEffect, useState } from "react";
import { Sparkles, AlertTriangle, Twitter, Trash2, Info } from "lucide-react";
import { Img } from "react-image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, TempUser, Badge as BadgeType } from "@/types/user";

interface ChartProps {
  initialUsers?: User[];
  initialTempUsers?: TempUser[];
  onUsersChange?: (users: User[], tempUsers: TempUser[]) => void;
  showControls?: boolean;
  calculateScore?: (twitter: number, wallet: number, telegram: number) => number;
}

export default function Chart({
  initialUsers = [],
  initialTempUsers = [],
  onUsersChange,
  showControls = true,
  calculateScore = (twitter, wallet, telegram) => twitter + wallet + telegram,
}: ChartProps) {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tempUsers, setTempUsers] = useState<TempUser[]>(initialTempUsers);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<{
    x: number;
    y: number;
    info: string;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load users from localStorage on initial render if no initial users provided
  useEffect(() => {
    if (initialUsers.length === 0 && initialTempUsers.length === 0) {
      const savedUsers = localStorage.getItem("users");
      if (savedUsers) {
        try {
          setUsers(JSON.parse(savedUsers));
        } catch (e) {
          console.error("Failed to parse saved users", e);
        }
      }
    }
  }, [initialUsers.length, initialTempUsers.length]);

  // Save users to localStorage when they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
    
    if (onUsersChange) {
      onUsersChange(users, tempUsers);
    }
  }, [users, tempUsers, onUsersChange]);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxScore = Math.max(
      100,
      ...users.map((user) => user.totalScore),
      ...tempUsers.map((user) => user.totalScore)
    );

    const maxBadges = Math.max(
      30,
      ...users.map((user) => user.badges.length),
      ...tempUsers.map((user) => user.badges.length)
    );

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Draw grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * rect.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * rect.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, rect.height - 30);
    ctx.lineTo(rect.width, rect.height - 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, rect.height);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText("Total Score", rect.width / 2, rect.height - 10);

    ctx.save();
    ctx.translate(10, rect.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Total Badges", 0, 0);
    ctx.restore();

    ctx.textAlign = "right";
    ctx.fillText("0", 25, rect.height - 25);
    ctx.fillText(maxScore.toString(), rect.width - 5, rect.height - 25);

    ctx.textAlign = "left";
    ctx.fillText("0", 35, rect.height - 35);
    ctx.fillText(maxBadges.toString(), 35, 15);

    const points: Array<{
      x: number;
      y: number;
      radius: number;
      user: User | TempUser;
    }> = [];

    // Draw user points
    const drawUserPoint = (user: User | TempUser, isTemp: boolean) => {
      const x = 30 + (user.totalScore / maxScore) * (rect.width - 60);
      const y =
        rect.height -
        30 -
        (user.badges.length / maxBadges) * (rect.height - 60);

      // Draw the user point
      ctx.beginPath();
      ctx.arc(x, y, isTemp ? 8 : 12, 0, Math.PI * 2);
      ctx.fillStyle = isTemp
        ? "rgba(255, 100, 100, 0.7)"
        : "rgba(138, 43, 226, 0.7)";
      ctx.fill();

      // Draw the username below the point
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`@${user.username}`, x, y + 15);

      points.push({ x, y, radius: isTemp ? 8 : 12, user });
    };

    users.forEach((user) => drawUserPoint(user, false));
    tempUsers.forEach((user) => drawUserPoint(user, true));

    // Add mousemove event listener
    const handleMouseMove = (event: MouseEvent) => {
      const { left, top } = rect;
      const mouseX = (event.clientX - left) * dpr;
      const mouseY = (event.clientY - top) * dpr;

      const hovered = points.find(
        (point) =>
          Math.sqrt(
            Math.pow(mouseX - point.x * dpr, 2) +
              Math.pow(mouseY - point.y * dpr, 2)
          ) < point.radius * dpr
      );

      if (hovered) {
        setHoveredUser({
          x: event.clientX - left,
          y: event.clientY - top,
          info: `Score: ${hovered.user.totalScore}, Badges: ${hovered.user.badges.length}`,
        });
      } else {
        setHoveredUser(null);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [users, tempUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);

    try {
      // In a real app, you would fetch actual user data from Twitter API
      // For now, we'll simulate with random data
      const twitterScore = Math.floor(Math.random() * 100);
      const walletScore = Math.floor(Math.random() * 100);
      const telegramScore = Math.floor(Math.random() * 100);

      // Calculate total score based on algorithm
      const totalScore = calculateScore(twitterScore, walletScore, telegramScore);

      // Generate random badges
      const badges: BadgeType[] = [
        { id: "1", name: "Early Adopter", icon: "🌟" },
        { id: "2", name: "Content Creator", icon: "📝" },
        { id: "3", name: "Community Builder", icon: "🏗️" },
      ].filter(() => Math.random() > 0.5);

      // Check if this is a full user or temp user
      const isFullUser = Math.random() > 0.3; // 70% chance of being a full user

      if (isFullUser) {
        const newUser: User = {
          id: Date.now().toString(),
          username,
          profileImageUrl: `/placeholder.svg?height=48&width=48`,
          twitterScore,
          walletScore,
          telegramScore,
          totalScore,
          badges,
          isVerified: Math.random() > 0.7,
        };
        setUsers([...users, newUser]);
      } else {
        // Create temporary user with only Twitter data
        const tempUser: TempUser = {
          id: `temp-${Date.now().toString()}`,
          username,
          profileImageUrl: `/placeholder.svg?height=48&width=48`,
          twitterScore,
          totalScore: twitterScore, // For temp users, total score is just Twitter score
          badges: badges.slice(0, 1), // Temp users get fewer badges
        };
        setTempUsers([...tempUsers, tempUser]);
      }

      setUsername("");
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearUsers = () => {
    setUsers([]);
    setTempUsers([]);
    localStorage.removeItem("users");
  };

  const allUsers = [...users, ...tempUsers];

  return (
    <div className="w-full max-w-6xl">
      {showControls && (
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 mb-6">
            <Sparkles className="text-purple-400" size={24} />
            User Score & Badge Analysis
          </h1>

          <form onSubmit={handleSubmit} className="w-full flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter Twitter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-gray-200 hover:bg-white/20"
            >
              <Twitter size={18} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowUserPanel(!showUserPanel)}
              className="bg-purple-600 border-purple-500 text-white hover:bg-purple-700"
            >
              <Sparkles size={18} />
            </Button>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {showUserPanel && (
          <div className="w-full md:w-96">
            <div
              className="bg-gradient-to-br from-purple-900/80 to-purple-800/50 rounded-lg overflow-hidden h-full border border-purple-500/50"
              style={{ backdropFilter: "blur(10px)" }}
            >
              <div className="bg-purple-800/80 p-3 border-b border-purple-500/50">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Sparkles className="text-purple-300 mr-2" size={20} />
                  User Analysis
                </h2>
              </div>

              <div className="p-4">
                {allUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-gray-200">
                    <div className="border-2 border-dashed border-purple-400/30 p-6 rounded-lg mb-4">
                      <Sparkles size={32} className="text-purple-300 mx-auto mb-2" />
                    </div>
                    <p>No users analyzed yet. Enter a Twitter username to see their score and badges.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {allUsers.map((user) => {
                      const isTemp = !("walletScore" in user);

                      return (
                        <div
                          key={user.id}
                          className={`${isTemp ? "bg-red-900/30" : "bg-purple-800/30"} rounded-lg p-3 border ${isTemp ? "border-red-500/50" : "border-purple-500/50"}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-glow border-purple-400/70">
                            <img
  src={user.profileImageUrl || "/placeholder.svg"}
  alt={user.username}
  width={40}
  height={40}
  className="w-full h-full object-cover"
/>

                            </div>
                            <div>
                              <h3 className="font-bold text-white">@{user.username}</h3>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-purple-200">Score: {user.totalScore}</span>
                                <span className="text-xs text-purple-200">•</span>
                                <span className="text-xs text-purple-200">Badges: {user.badges.length}</span>
                              </div>
                            </div>

                            {isTemp && (
                              <div className="ml-auto px-2 py-1 bg-red-600/70 rounded text-xs font-medium text-white flex items-center">
                                <AlertTriangle size={12} className="mr-1" />
                                Temp
                              </div>
                            )}

                            {!isTemp && (user as User).isVerified && (
                              <div className="ml-auto px-2 py-1 bg-blue-600/70 rounded text-xs font-medium text-white">
                                Verified
                              </div>
                            )}
                          </div>

                          <div className="mt-3">
                            <h4 className="text-xs font-semibold text-purple-200 mb-1">Badges:</h4>
                            <div className="flex flex-wrap gap-2">
                              {user.badges.map((badge) => (
                                <Badge
                                  key={badge.id}
                                  variant="outline"
                                  className="bg-purple-700/50 text-white border-purple-400/50"
                                >
                                  {badge.icon} {badge.name}
                                </Badge>
                              ))}

                              {user.badges.length === 0 && (
                                <span className="text-xs text-purple-300">No badges earned yet</span>
                              )}
                            </div>
                          </div>

                          {!isTemp && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <div className="bg-purple-800/50 p-2 rounded">
                                <div className="text-xs text-purple-300">Twitter</div>
                                <div className="font-bold text-white">{(user as User).twitterScore}</div>
                              </div>
                              <div className="bg-purple-800/50 p-2 rounded">
                                <div className="text-xs text-purple-300">Wallet</div>
                                <div className="font-bold text-white">{(user as User).walletScore}</div>
                              </div>
                              <div className="bg-purple-800/50 p-2 rounded">
                                <div className="text-xs text-purple-300">Telegram</div>
                                <div className="font-bold text-white">{(user as User).telegramScore}</div>
                              </div>
                            </div>
                          )}

                          {isTemp && (
                            <div className="mt-3 p-2 bg-red-900/30 rounded border border-red-500/30">
                              <p className="text-xs text-red-200">
                                This is a temporary user with limited data. For a complete profile, please connect wallet and
                                Telegram.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`flex-1 ${showUserPanel ? "md:max-w-[calc(100%-24rem)]" : "w-full"}`}>
          <div className="p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
            <div className="w-full relative">
              <div className="flex justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-600 mr-2"></div>
                  <span className="text-white text-sm">Full Users</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-400 mr-2"></div>
                  <span className="text-white text-sm">Temporary Users</span>
                </div>
              </div>
              <canvas
                ref={canvasRef}
                className="w-full aspect-square rounded-lg border border-purple-500/50 bg-black/50"
                style={{
                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
                  background: "linear-gradient(135deg, rgba(20, 20, 20, 0.8), rgba(30, 10, 60, 0.8))",
                }}
              />
              {hoveredUser && (
                <div
                  className="absolute text-sm text-white bg-black/80 px-2 py-1 rounded whitespace-pre"
                  style={{
                    left: `${hoveredUser.x}px`,
                    top: `${hoveredUser.y}px`,
                  }}
                >
                  {hoveredUser.info}
                </div>
              )}
            </div>

            {users.length === 0 && tempUsers.length === 0 && (
              <div className="mt-4 p-4 bg-purple-800/30 rounded-lg border border-purple-500/30 text-center">
                <Info className="mx-auto mb-2 text-purple-300" size={24} />
                <p className="text-purple-100">
                  Enter a Twitter username to plot it on the graph. The X-axis represents total score, and the Y-axis
                  represents total badges.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showControls && (
        <div className="flex justify-center mt-6 gap-4">
          <Button
            onClick={() => setShowUserPanel(!showUserPanel)}
            variant="outline"
            className="bg-purple-600/90 hover:bg-purple-700 border-purple-500 text-white rounded-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            User details
          </Button>

          <Button
            onClick={clearUsers}
            variant="outline"
            className="bg-pink-500/80 hover:bg-pink-600 border-pink-400 text-white rounded-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 mt-8">
        <p>For a proper plot with total score and total badges, please login with all required logins</p>
      </div>
    </div>
  );
}