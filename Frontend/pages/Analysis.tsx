import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassMorphicCard from '@/components/ui/GlassMorphicCard';
import TransitionEffect from '@/components/TransitionEffect';
import ScoreCounter from '@/components/ScoreCounter';
import ReferFriend from './ReferFriend';
import Leaderboard from './Leaderboard'
import { useRef, useEffect } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Copy,
  ChevronUp,
  Award,
  Share2,
  Download,
  X,

  Linkedin,
  Shield,
  Star,

  Trophy,
  Sparkles,
  Check,
  Image,
  Link,
} from "lucide-react"
import html2canvas from "html2canvas"

import { 
  ArrowLeft, 
  BarChart,
  Wallet,
  Twitter,
  MessageCircle,
  Users,
  Zap,
  Calendar,
  TrendingUp,
  Activity,
  Circle
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

const Analysis = () => {
  const navigate = useNavigate();


  //Leaderboard Data


  const textShadowStyle = {
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  }
  
  
    const [activeTab, setActiveTab] = useState("market")
    const [activeTimeframe, setActiveTimeframe] = useState("24H")
    const [currentPage, setCurrentPage] = useState(7)
    const [showScoreCard, setShowScoreCard] = useState(false)
    const [showBadges, setShowBadges] = useState(false)
    const [showBestBadge, setShowBestBadge] = useState(false)
    const [sortColumn, setSortColumn] = useState("rank")
    const [sortDirection, setSortDirection] = useState("asc")
    const [showNotifications, setShowNotifications] = useState(false)
    const [copyLinkStatus, setCopyLinkStatus] = useState("")
    const [scoreCardCopyStatus, setScoreCardCopyStatus] = useState({
      link: "",
      image: "",
    })
    const scoreCardRef = useRef(null)
    const notificationRef = useRef(null)
    const bellRef = useRef(null)
    const [preparingDownload, setPreparingDownload] = useState(false)
    const [networkNodes, setNetworkNodes] = useState([])
    const [networkLinks, setNetworkLinks] = useState([])
    const networkCanvasRef = useRef(null)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    // Generate network data
    useEffect(() => {
      // Generate random nodes
      const nodes = []
      const centerX = 200
      const centerY = 200
      const radius = 180
  
      // Create center node (user)
      nodes.push({
        id: "user",
        x: centerX,
        y: centerY,
        radius: 20,
        color: "#4ade80", // Green for user
        image: null,
      })
  
      // Create surrounding nodes with different sizes
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40
        const distance = radius * (0.5 + Math.random() * 0.5)
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance
  
        // Vary node sizes more dramatically
        const nodeSize = 6 + Math.random() * 14
  
        // Add some colored nodes (like in the image)
        const colors = ["#FF5555", "#55AAFF", "#FFAA55", "#55FF55", "#AA55FF", "#FFFF55"]
        const color = Math.random() > 0.7 ? colors[Math.floor(Math.random() * colors.length)] : "#FFFFFF"
  
        nodes.push({
          id: `node-${i}`,
          x,
          y,
          radius: nodeSize,
          color,
          image: null,
        })
      }
  
      // Generate links between nodes - more connections to match the dense network in the image
      const links = []
  
      // Connect center node to many others
      for (let i = 1; i < nodes.length; i++) {
        if (Math.random() > 0.2) {
          // 80% chance of connection to center
          links.push({
            source: 0,
            target: i,
            strength: 0.3 + Math.random() * 0.7,
          })
        }
      }
  
      // Connect nodes to each other - more connections
      for (let i = 1; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() > 0.75) {
            // 25% chance of connection between nodes
            links.push({
              source: i,
              target: j,
              strength: 0.1 + Math.random() * 0.4,
            })
          }
        }
      }
  
      setNetworkNodes(nodes)
      setNetworkLinks(links)
    }, [])
  
    // Draw network visualization
    useEffect(() => {
      if (!networkCanvasRef.current || networkNodes.length === 0) return
  
      const canvas = networkCanvasRef.current
      const ctx = canvas.getContext("2d")
      const dpr = window.devicePixelRatio || 1
  
      // Set canvas size with device pixel ratio for sharp rendering
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
  
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      // Draw links with glow effect to match the image
      networkLinks.forEach((link) => {
        const source = networkNodes[link.source]
        const target = networkNodes[link.target]
  
        // Create gradient for links
        const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y)
        gradient.addColorStop(0, `rgba(74, 222, 128, ${link.strength * 0.8})`)
        gradient.addColorStop(1, `rgba(20, 184, 166, ${link.strength * 0.8})`)
  
        // Draw glowing line
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = link.strength * 2.5
        ctx.globalAlpha = 0.8
        ctx.stroke()
  
        // Add glow effect
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = link.strength * 5
        ctx.globalAlpha = 0.2
        ctx.stroke()
  
        ctx.globalAlpha = 1.0
      })
  
      // Draw nodes
      networkNodes.forEach((node) => {
        // Draw glow effect for nodes
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${node.id === "user" ? "74, 222, 128" : "255, 255, 255"}, 0.2)`
        ctx.fill()
  
        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()
  
        // Add border to nodes
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = 1.5
        ctx.stroke()
  
        if (node.image) {
          // Draw image if available
          const img = new Image()
          img.src = node.image
          img.crossOrigin = "anonymous"
          img.onload = () => {
            ctx.save()
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, node.x - node.radius, node.y - node.radius, node.radius * 2, node.radius * 2)
            ctx.restore()
          }
        }
      })
  
      // Animation frame
      const animate = () => {
        // Simple animation - slightly move nodes
        networkNodes.forEach((node) => {
          if (node.id !== "user") {
            // Don't move the center node
            node.x += (Math.random() - 0.5) * 0.5
            node.y += (Math.random() - 0.5) * 0.5
          }
        })
  
        // Redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height)
  
        // Draw links with glow effect
        networkLinks.forEach((link) => {
          const source = networkNodes[link.source]
          const target = networkNodes[link.target]
  
          // Create gradient for links
          const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y)
          gradient.addColorStop(0, `rgba(74, 222, 128, ${link.strength * 0.8})`)
          gradient.addColorStop(1, `rgba(20, 184, 166, ${link.strength * 0.8})`)
  
          // Draw glowing line
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = gradient
          ctx.lineWidth = link.strength * 2.5
          ctx.globalAlpha = 0.8
          ctx.stroke()
  
          // Add glow effect
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = gradient
          ctx.lineWidth = link.strength * 5
          ctx.globalAlpha = 0.2
          ctx.stroke()
  
          ctx.globalAlpha = 1.0
        })
  
        // Draw nodes
        networkNodes.forEach((node) => {
          // Draw glow effect for nodes
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${node.id === "user" ? "74, 222, 128" : "255, 255, 255"}, 0.2)`
          ctx.fill()
  
          // Draw node
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
  
          // Add border to nodes
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
          ctx.lineWidth = 1.5
          ctx.stroke()
        })
  
        requestAnimationFrame(animate)
      }
  
      const animationId = requestAnimationFrame(animate)
  
      return () => {
        cancelAnimationFrame(animationId)
      }
    }, [networkNodes, networkLinks])
  
    // Close notifications when clicking outside
    useEffect(() => {
      function handleClickOutside(event) {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(event.target) &&
          bellRef.current &&
          !bellRef.current.contains(event.target)
        ) {
          setShowNotifications(false)
        }
      }
  
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])
  
    // Reset copy status after 2 seconds
    useEffect(() => {
      if (copyLinkStatus) {
        const timer = setTimeout(() => {
          setCopyLinkStatus("")
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [copyLinkStatus])
  
    // Reset score card copy status
    useEffect(() => {
      if (scoreCardCopyStatus.link || scoreCardCopyStatus.image) {
        const timer = setTimeout(() => {
          setScoreCardCopyStatus({ link: "", image: "" })
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [scoreCardCopyStatus])
  
    // Mock data for the leaderboard - Extended with more users for pagination
    const users = [
      {
        id: 1,
        rank: 137,
        name: "McOso.eth",
        handle: "@McOso_",
        twitterFollowers: 797,
        twitterScore: 99,
        walletScore: 32,
        totalScore: 32,
        percentage: "12.42%",
      },
      {
        id: 2,
        rank: 138,
        name: "Felipe Montealegre (IFS)",
        handle: "@TheiaResearch",
        twitterFollowers: 5842,
        twitterScore: 783,
        walletScore: 32,
        totalScore: 32,
        percentage: "13.40%",
      },
      {
        id: 3,
        rank: 139,
        name: "orkun",
        handle: "@x_orkun",
        twitterFollowers: 4823,
        twitterScore: 393,
        walletScore: 32,
        totalScore: 32,
        percentage: "8.15%",
      },
      {
        id: 4,
        rank: 140,
        name: "hitesh.eth",
        handle: "@hmalviya9",
        twitterFollowers: 85705,
        twitterScore: 1448,
        walletScore: 32,
        totalScore: 32,
        percentage: "1.69%",
      },
      {
        id: 5,
        rank: 136,
        name: "yuga.eth",
        handle: "@yugacohler",
        twitterFollowers: 27814,
        twitterScore: 2013,
        walletScore: 32,
        totalScore: 33,
        percentage: "7.24%",
      },
      {
        id: 6,
        rank: 141,
        name: "Mike Dudas",
        handle: "@mdudas",
        twitterFollowers: 168650,
        twitterScore: 5739,
        walletScore: 32,
        totalScore: 32,
        percentage: "3.40%",
      },
      {
        id: 7,
        rank: 142,
        name: "Alex Krüger",
        handle: "@krugermacro",
        twitterFollowers: 207672,
        twitterScore: 2934,
        walletScore: 32,
        totalScore: 32,
        percentage: "1.41%",
      },
      {
        id: 8,
        rank: 143,
        name: "The Assistant",
        handle: "@SonicAssistant",
        twitterFollowers: 6228,
        twitterScore: 173,
        walletScore: 32,
        totalScore: 32,
        percentage: "2.78%",
      },
      // Additional users for pagination
      {
        id: 9,
        rank: 144,
        name: "Crypto Whale",
        handle: "@whale_crypto",
        twitterFollowers: 125000,
        twitterScore: 3500,
        walletScore: 95,
        totalScore: 95,
        percentage: "4.25%",
      },
      {
        id: 10,
        rank: 145,
        name: "DeFi Degen",
        handle: "@defi_master",
        twitterFollowers: 45000,
        twitterScore: 1200,
        walletScore: 75,
        totalScore: 75,
        percentage: "5.10%",
      },
      {
        id: 11,
        rank: 146,
        name: "NFT Collector",
        handle: "@nft_hunter",
        twitterFollowers: 32000,
        twitterScore: 950,
        walletScore: 120,
        totalScore: 120,
        percentage: "6.75%",
      },
      {
        id: 12,
        rank: 147,
        name: "Blockchain Dev",
        handle: "@chain_coder",
        twitterFollowers: 18500,
        twitterScore: 750,
        walletScore: 200,
        totalScore: 200,
        percentage: "9.30%",
      },
      {
        id: 13,
        rank: 148,
        name: "Metaverse Explorer",
        handle: "@meta_traveler",
        twitterFollowers: 22000,
        twitterScore: 820,
        walletScore: 65,
        totalScore: 65,
        percentage: "3.85%",
      },
      {
        id: 14,
        rank: 149,
        name: "DAO Contributor",
        handle: "@dao_builder",
        twitterFollowers: 15000,
        twitterScore: 650,
        walletScore: 180,
        totalScore: 180,
        percentage: "8.20%",
      },
      {
        id: 15,
        rank: 150,
        name: "Crypto Analyst",
        handle: "@crypto_charts",
        twitterFollowers: 75000,
        twitterScore: 2100,
        walletScore: 45,
        totalScore: 45,
        percentage: "2.15%",
      },
      {
        id: 16,
        rank: 151,
        name: "Token Economist",
        handle: "@token_econ",
        twitterFollowers: 28000,
        twitterScore: 920,
        walletScore: 85,
        totalScore: 85,
        percentage: "4.75%",
      },
      // More users for additional pages
      ...[...Array(40)].map((_, i) => ({
        id: 17 + i,
        rank: 152 + i,
        name: `User ${152 + i}`,
        handle: `@user${152 + i}`,
        twitterFollowers: Math.floor(Math.random() * 100000) + 1000,
        twitterScore: Math.floor(Math.random() * 3000) + 100,
        walletScore: Math.floor(Math.random() * 200) + 20,
        totalScore: Math.floor(Math.random() * 200) + 20,
        telegramScore: Math.floor(Math.random() * 200) + 20,
        percentage: (Math.random() * 10 + 1).toFixed(2) + "%",
      })),
    ]
  
    // Mock data for user badges
    const userBadges = [
      {
        id: 1,
        name: "Diamond Hodler",
        icon: Trophy,
        color: "text-blue-400",
        description: "Held tokens for over 1 year",
        earnedDate: "2023-12-15",
      },
      {
        id: 2,
        name: "Early Adopter",
        icon: Star,
        color: "text-yellow-400",
        description: "Joined during platform beta",
        earnedDate: "2023-10-22",
      },
      {
        id: 3,
        name: "Social Butterfly",
        icon: Sparkles,
        color: "text-purple-400",
        description: "Connected all social accounts",
        earnedDate: "2024-01-05",
      },
      {
        id: 4,
        name: "Liquidity Provider",
        icon: Zap,
        color: "text-green-400",
        description: "Provided liquidity to the protocol",
        earnedDate: "2024-02-18",
      },
      {
        id: 5,
        name: "Community Guardian",
        icon: Shield,
        color: "text-red-400",
        description: "Actively participated in governance",
        earnedDate: "2024-03-01",
      },
    ]
  
    // Mock notifications
    const notifications = [
      {
        id: 1,
        type: "badge",
        message: "You've earned the Diamond Hodler badge!",
        time: "2 days ago",
        icon: Trophy,
        color: "text-blue-400",
      },
      {
        id: 2,
        type: "rank",
        message: "Your rank increased by 3 positions!",
        time: "5 hours ago",
        icon: ChevronUp,
        color: "text-green-400",
      },
      {
        id: 3,
        type: "profile",
        message: "5 people viewed your profile today",
        time: "1 hour ago",
        icon: MessageCircle,
        color: "text-purple-400",
      },
      {
        id: 4,
        type: "score",
        message: "Your Twitter score increased by 25 points",
        time: "3 hours ago",
        icon: Twitter,
        color: "text-blue-400",
      },
    ]
  
    // Current user data
    const currentUser = {
      rank: 142,
      name: "Hardik Kwatra",
      handle: "@BRUTALG21614093",
      twitterFollowers: 12453,
      twitterScore: 785,
      telegramScore: 342,
      walletScore: 523,
      totalScore: 1650,
      percentage: "6.3%",
      smartFollowers: 180,
      topPercentage: "8.7%",
      lastUpdated: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      category: "Emerging CT",
    }
  
    // Generate top smart followers
    const topSmartFollowers = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=follower-${i}`,
    }))
  
    // Function to handle sorting
    const handleSort = (column) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      } else {
        setSortColumn(column)
        setSortDirection("asc")
      }
    }
  
    // Function to generate random avatar URL
    const getRandomAvatar = (seed) => {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
    }
  
    // Function to handle pagination
    const handlePageChange = (page) => {
      setCurrentPage(page)
    }
  
    // Function to copy profile link
    const copyProfileLink = () => {
      const profileLink = `https://cluster.protocol/profile/${currentUser.handle}`
      navigator.clipboard.writeText(profileLink)
      setCopyLinkStatus("copied")
    }
  
    // Function to copy score card link
    const copyScoreCardLink = () => {
      const scoreCardLink = `https://cluster.protocol/scorecard/${currentUser.handle}`
      navigator.clipboard.writeText(scoreCardLink)
      setScoreCardCopyStatus({ ...scoreCardCopyStatus, link: "copied" })
    }
  
    // Function to copy score card as image
    const copyScoreCardImage = async () => {
      if (scoreCardRef.current) {
        try {
          setScoreCardCopyStatus({ ...scoreCardCopyStatus, image: "processing" })
          const canvas = await html2canvas(scoreCardRef.current)
          
          // Check if Clipboard API and ClipboardItem are supported
          if (navigator.clipboard && window.ClipboardItem) {
            canvas.toBlob((blob) => {
              if (blob) {
                const item = new ClipboardItem({ "image/png": blob })
                navigator.clipboard.write([item])
                  .then(() => {
                    setScoreCardCopyStatus({ ...scoreCardCopyStatus, image: "copied" })
                  })
                  .catch(err => {
                    console.error("Error copying image:", err)
                    // Fallback to download if copying fails
                    downloadFallback(canvas)
                  })
              }
            })
          } else {
            // Fallback for browsers that don't support ClipboardItem
            downloadFallback(canvas)
          }
        } catch (err) {
          console.error("Error copying image:", err)
          setScoreCardCopyStatus({ ...scoreCardCopyStatus, image: "error" })
        }
      }
    }
  
    // Fallback download function for browsers without clipboard support
    const downloadFallback = (canvas) => {
      const link = document.createElement("a")
      link.download = `cluster-scorecard-${currentUser.handle}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      setScoreCardCopyStatus({ ...scoreCardCopyStatus, image: "downloaded" })
    }
  
    // Function to download score card as image
    const downloadScoreCard = async () => {
      if (scoreCardRef.current) {
        try {
          setPreparingDownload(true)
          // Wait for the state to update and re-render
          await new Promise((resolve) => setTimeout(resolve, 100))

          const canvas = await html2canvas(scoreCardRef.current)
          const link = document.createElement("a")
          link.download = `cluster-scorecard-${currentUser.handle}.png`
          link.href = canvas.toDataURL("image/png")
          link.click()

          // Reset back to view mode
          setPreparingDownload(false)
        } catch (err) {
          console.error("Error downloading image:", err)
          setPreparingDownload(false)
        }
      }
    }
  
    // Sort users based on current sort settings
    const sortedUsers = [...users].sort((a, b) => {
      let valueA = a[sortColumn]
      let valueB = b[sortColumn]
  
      // Handle percentage strings
      if (sortColumn === "percentage") {
        valueA = Number.parseFloat(valueA)
        valueB = Number.parseFloat(valueB)
      }
  
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
  
    // Get paginated users
    const itemsPerPage = 8
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage)
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  
  // Social media analytics data
  const socialData = [
    { name: 'Twitter', value: 4200, color: '#1DA1F2' },
    { name: 'Telegram', value: 5250, color: '#0088CC' },
    { name: 'Discord', value: 3100, color: '#5865F2' },
  ];
  
  // Wallet activity data
  const walletData = [
    { name: 'Trading', value: 2500, color: '#00E0B0' },
    { name: 'NFTs', value: 1800, color: '#8B5CF6' },
    { name: 'DeFi', value: 2450, color: '#F97316' },
    { name: 'Staking', value: 1650, color: '#F43F5E' }
  ];
  
  // Historical score data
  const historicalData = [
    { day: 'Mon', score: 780 },
    { day: 'Tue', score: 800 },
    { day: 'Wed', score: 824 },
    { day: 'Thu', score: 856 },
    { day: 'Fri', score: 890 },
    { day: 'Sat', score: 910 },
    { day: 'Sun', score: 927 },
  ];
  
  // Top communities
  const topCommunities = [
    { name: 'DeFi Degens', members: 12500, category: 'DeFi', active: true },
    { name: 'NFT Collectors', members: 8300, category: 'NFT', active: true },
    { name: 'Solana Builders', members: 6700, category: 'Tech', active: false },
    { name: 'Alpha Leaks', members: 5200, category: 'Trading', active: true },
  ];
  
  // Recent activity
  const recentActivity = [
    { type: 'wallet', action: 'Bridged assets to Arbitrum', time: '2 hours ago', icon: <Wallet className="text-degen-glow" size={16} /> },
    { type: 'social', action: 'Joined Alpha Leaks group', time: '5 hours ago', icon: <Users className="text-blue-400" size={16} /> },
    { type: 'trading', action: 'Swapped ETH for ARB', time: '1 day ago', icon: <Activity className="text-orange-400" size={16} /> },
    { type: 'social', action: 'Reached 500 followers', time: '2 days ago', icon: <Twitter className="text-blue-400" size={16} /> },
  ];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-2 border border-white/10 rounded-md text-sm">
          <p className="text-xs">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden p-4 md:p-6 pb-20">
      {/* Background effects - simplified to black */}
   
      <div className="absolute inset-0 bg-gradient-to-tr from-degen-dark/40 to-black/90 z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
      <div className="absolute top-1 right-4">
  <ReferFriend />
</div>

        <TransitionEffect>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            {/* <div>
              <button 
                onClick={() => navigate('/scorecard')}
                className="glass px-3 py-1.5 rounded-full flex items-center gap-2 mb-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back to Scorecard
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-glow">Degen Analytics Dashboard</h1>
            </div>
            
            <div className="glass py-1.5 px-4 rounded-full flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm"> <span className="font-bold text-degen-glow"></span></span>
            </div> */}
          </div>
        </TransitionEffect>

        <div className='mt-14'><Leaderboard/></div>
        
        <Tabs defaultValue="analytics" className="w-full" onValueChange={setActiveTab}>
          <TransitionEffect delay={200}>
            <TabsList className="glass w-full justify-start mb-6 p-1">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-degen-accent/20 data-[state=active]:text-degen-glow">
                <BarChart size={16} className="mr-2" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-degen-accent/20 data-[state=active]:text-degen-glow">
                <Activity size={16} className="mr-2" /> Activity
              </TabsTrigger>
              <TabsTrigger value="communities" className="data-[state=active]:bg-degen-accent/20 data-[state=active]:text-degen-glow">
                <Users size={16} className="mr-2" /> Communities
              </TabsTrigger>
            </TabsList>
          </TransitionEffect>
          
          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <TransitionEffect delay={300}>
                <GlassMorphicCard>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Zap size={18} className="text-degen-glow" /> Score Trend
                    </h2>
                    <Badge variant="outline" className="bg-degen-accent/10 text-degen-glow border-degen-accent/30">
                      <TrendingUp size={12} className="mr-1" /> +147 points
                    </Badge>
                  </div>
                  
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" domain={[750, 950]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#36FF9C" 
                          strokeWidth={2} 
                          dot={{ r: 4, strokeWidth: 2, fill: "#0A1F1C" }}
                          activeDot={{ r: 6, stroke: "#36FF9C", strokeWidth: 2, fill: "#36FF9C" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
              
              <TransitionEffect delay={400}>
                <GlassMorphicCard>
                  <div className="flex items-center gap-2 mb-4">
                    <Twitter size={18} className="text-blue-400" />
                    <h2 className="text-lg font-semibold">Social Score</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {socialData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value} pts</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${(item.value / 6000) * 100}%`,
                              backgroundColor: item.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
              
              <TransitionEffect delay={500}>
                <GlassMorphicCard>
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet size={18} className="text-degen-glow" />
                    <h2 className="text-lg font-semibold">Wallet Score</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {walletData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value} pts</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full shimmer" 
                            style={{ 
                              width: `${(item.value / 3000) * 100}%`,
                              backgroundColor: item.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransitionEffect delay={600}>
                <GlassMorphicCard>
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <BarChart size={18} className="text-degen-accent" /> Activities Comparison
                  </h2>
                  
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[...socialData, ...walletData]}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {[...socialData, ...walletData].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
              
             
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TransitionEffect delay={300}>
                <GlassMorphicCard className="lg:col-span-2">
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <Activity size={18} className="text-degen-accent" /> Recent Activity
                  </h2>
                  
                  <div className="space-y-1">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="glass p-4 rounded-lg flex items-center gap-4 hover:bg-white/5 transition-all">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-xs text-white/60">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
              
              <TransitionEffect delay={400}>
                <GlassMorphicCard>
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <Calendar size={18} className="text-degen-accent" /> Weekly Highlights
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="glass p-4 rounded-lg border-l-2 border-green-500">
                      <h3 className="text-sm font-medium text-green-400">Achievements</h3>
                      <p className="text-sm mt-1">Reached 900+ score milestone</p>
                    </div>
                    
                    <div className="glass p-4 rounded-lg border-l-2 border-blue-500">
                      <h3 className="text-sm font-medium text-blue-400">Social Growth</h3>
                      <p className="text-sm mt-1">Added 3 new high-value connections</p>
                    </div>
                    
                    <div className="glass p-4 rounded-lg border-l-2 border-purple-500">
                      <h3 className="text-sm font-medium text-purple-400">Trading Activity</h3>
                      <p className="text-sm mt-1">Completed 12 trades across 3 chains</p>
                    </div>
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
            </div>
          </TabsContent>
          
          <TabsContent value="communities" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TransitionEffect delay={300}>
                <GlassMorphicCard className="lg:col-span-2">
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <Users size={18} className="text-degen-accent" /> Top Communities
                  </h2>
                  
                  <div className="space-y-2">
                    {topCommunities.map((community, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-lg glass flex items-center justify-between hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-degen-accent/30 to-degen-glow/10 flex items-center justify-center">
                            <Users size={20} className="text-degen-glow" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{community.name}</h3>
                              {community.active && (
                                <span className="flex items-center text-xs">
                                  <Circle fill="#10B981" className="text-green-500 mr-1" size={8} /> Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-white/60">
                              <Badge className="bg-white/10 text-white/80 hover:bg-white/20 mr-2">{community.category}</Badge>
                              <span>{community.members.toLocaleString()} members</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-xs glass px-3 py-1.5 rounded-full hover:bg-degen-accent/20 transition-all">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
              
              <TransitionEffect delay={400}>
                <GlassMorphicCard>
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <Zap size={18} className="text-degen-accent" /> Community Score Impact
                  </h2>
                  
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-3">
                      <div className="text-3xl font-bold text-glow">
                        <ScoreCounter value={215} suffix="+" />
                      </div>
                    </div>
                    <p className="text-sm text-white/60">Points from community participation</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Group Activity</span>
                      <span>120 pts</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '55%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conversation Quality</span>
                      <span>95 pts</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </GlassMorphicCard>
              </TransitionEffect>
            </div>
          </TabsContent>
        </Tabs>
      </div>
       {/* Tabs and Table Section */}
              <div className="px-16 mt-8">
                <div className="flex justify-between mb-4">
                  <div className="flex space-x-4">
                    <button
                      className={`px-4 py-2 rounded-md flex items-center transition-colors ${activeTab === "market" ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-black/30 backdrop-blur-md border border-purple-500/20 hover:bg-black/40"}`}
                      onClick={() => setActiveTab("market")}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Market
                    </button>
                   
                   
                  </div>
      
                  <div className="flex bg-black/30 backdrop-blur-md rounded-md overflow-hidden border border-purple-500/20">
                    {["24H", "48H", "72H", "7D", "30D", "3M", "6M", "All"].map((timeframe) => (
                      <button
                        key={timeframe}
                        className={`px-3 py-1 transition-colors ${activeTimeframe === timeframe ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-purple-900/40"}`}
                        onClick={() => setActiveTimeframe(timeframe)}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
      
                {/* Table */}
                <div className="bg-black/30 backdrop-blur-md backdrop-filter rounded-lg overflow-hidden border border-purple-500/20">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="px-4 py-3 text-left">
                          <button className="flex items-center" onClick={() => handleSort("rank")}>
                            <span>Rank</span>
                            {sortColumn === "rank" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <button className="flex items-center" onClick={() => handleSort("name")}>
                            <span>Name</span>
                            {sortColumn === "name" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <button className="flex items-center" onClick={() => handleSort("totalScore")}>
                            <span>Telegram Score</span>
                            {sortColumn === "totalScore" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <button className="flex items-center" onClick={() => handleSort("walletScore")}>
                            <span>Wallet Score</span>
                            {sortColumn === "walletScore" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <button className="flex items-center" onClick={() => handleSort("twitterScore")}>
                            <span>Twitter Score</span>
                            {sortColumn === "twitterScore" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <button className="flex items-center" onClick={() => handleSort("twitterFollowers")}>
                            <span>Twitter Followers</span>
                            {sortColumn === "twitterFollowers" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <button className="flex items-center" onClick={() => handleSort("percentage")}>
                            <span>Total Score</span>
                            {sortColumn === "percentage" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ))}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`${index % 2 === 0 ? "bg-purple-900/20" : ""} hover:bg-purple-900/30 transition-colors`}
                        >
                          <td className="px-4 py-3">{user.rank}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full overflow-hidden border border-purple-500/30">
                                <img
                                  src={getRandomAvatar(user.id) || "/placeholder.svg"}
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="ml-2">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-400">{user.handle}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{user.telegramScore}</td>
                          <td className="px-4 py-3">{user.walletScore}</td>
                          <td className="px-4 py-3">{user.twitterScore}</td>
                          <td className="px-4 py-3">{user.twitterFollowers.toLocaleString()}</td>
                          <td className="px-4 py-3">{user.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
      
                {/* Data update info */}
                <div className="text-gray-400 text-sm mt-2">
                  Data updates every hour. Rounded to the nearest whole number.
                </div>
      
                {/* Pagination */}
                <div className="flex justify-center mt-6">
                  <div className="flex">
                    <button
                      className="h-10 w-10 flex items-center justify-center rounded-md bg-black/30 backdrop-blur-md backdrop-filter text-gray-400 hover:bg-purple-900/40 transition-colors border border-purple-500/20"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
      
                    <button
                      className={`h-10 w-10 flex items-center justify-center rounded-md ml-1 transition-colors ${
                        currentPage === 1
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "bg-black/30 backdrop-blur-md backdrop-filter text-gray-400 hover:bg-purple-900/40 border border-purple-500/20"
                      }`}
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
      
                    {currentPage > 3 && (
                      <div className="h-10 w-10 flex items-center justify-center text-gray-400 ml-1">...</div>
                    )}
      
                    {Array.from({ length: 5 }, (_, i) => {
                      const page = currentPage - 2 + i
                      return (
                        page > 1 &&
                        page < totalPages && (
                          <button
                            key={page}
                            className={`h-10 w-10 flex items-center justify-center rounded-md ml-1 transition-colors ${
                              currentPage === page
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                : "bg-black/30 backdrop-blur-md backdrop-filter text-gray-400 hover:bg-purple-900/40 border border-purple-500/20"
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        )
                      )
                    })}
      
                    {currentPage < totalPages - 2 && (
                      <div className="h-10 w-10 flex items-center justify-center text-gray-400 ml-1">...</div>
                    )}
      
                    <button
                      className={`h-10 w-10 flex items-center justify-center rounded-md ml-1 transition-colors ${
                        currentPage === totalPages
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "bg-black/30 backdrop-blur-md backdrop-filter text-gray-400 hover:bg-purple-900/40 border border-purple-500/20"
                      }`}
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
      
                    <button
                      className="h-10 w-10 flex items-center justify-center rounded-md bg-black/30 backdrop-blur-md backdrop-filter text-gray-400 hover:bg-purple-900/40 transition-colors ml-1 border border-purple-500/20"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
    </div>
  );
};

export default Analysis;
