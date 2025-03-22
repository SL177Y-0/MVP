
import { useState, useRef, useEffect } from "react"
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
  Twitter,
  Wallet,
  X,
  MessageCircle,
  Linkedin,
  Shield,
  Star,
  Zap,
  Trophy,
  Sparkles,
  Check,
  Image,
  Link,
} from "lucide-react"
import html2canvas from "html2canvas"


const textShadowStyle = {
  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
}

export default function ClusterDashboard() {
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
        canvas.toBlob((blob) => {
          const item = new ClipboardItem({ "image/png": blob })
          navigator.clipboard.write([item])
          setScoreCardCopyStatus({ ...scoreCardCopyStatus, image: "copied" })
        })
      } catch (err) {
        console.error("Error copying image:", err)
        setScoreCardCopyStatus({ ...scoreCardCopyStatus, image: "error" })
      }
    }
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
  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center text-white [&_h1]:text-shadow [&_h2]:text-shadow [&_h3]:text-shadow [&_h4]:text-shadow [&_th]:text-shadow [&_.font-bold]:text-shadow [&_.font-medium]:text-shadow"
      style={{
        background: "linear-gradient(135deg, #010101 0%, #121212 100%)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="min-h-screen backdrop-blur-sm backdrop-filter">
       
       

        {/* Profile Section */}
        <div className="px-16 py-6 relative z-10">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center text-xl font-bold border-2 border-purple-400/30">
              HK
            </div>

            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <span className="text-gray-400 ml-2">{currentUser.handle}</span>
                <div className="relative ml-2">
                  <button onClick={copyProfileLink} className="text-gray-400 hover:text-white transition-colors group">
                    <Copy className="h-4 w-4" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/30 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {copyLinkStatus === "copied" ? "Link copied!" : "Copy link"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center mt-2">
                <div className="flex items-center bg-black/30 backdrop-blur-md rounded-full px-3 py-1 border border-purple-500/20">
                  {/* <span className="text-purple-400">0</span> */}
                  <span className="text-purple-400">Rank 142</span>
                </div>

                <div className="flex items-center bg-black/30 backdrop-blur-md rounded-full px-3 py-1 ml-2 border border-purple-500/20">
                  <Award className="h-4 w-4 text-purple-400 mr-1" />
                  <span className="text-purple-400">Diamond Holder</span>
                </div>
              </div>
            </div>
          </div>

         
        </div>

        {/* Stats Section */}
        <div className="px-16 grid grid-cols-3 gap-4">
          {/* Total Badges */}
          <div className="bg-black/30 backdrop-blur-md backdrop-filter border border-purple-500/20 rounded-lg p-6 hover:bg-black/40 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Total Badges</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center mt-4">
              <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                <Award className="h-8 w-8 text-purple-400" />
              </div>
              <span className="text-4xl font-bold ml-4">{userBadges.length}</span>
            </div>
            <div className="flex items-center mt-2 text-purple-400">
              <span>+1</span>
              <span className="ml-2 text-gray-400">(24h Change)</span>
            </div>
          </div>

          {/* Best Badge */}
          <div
            className="bg-black/30 backdrop-blur-md backdrop-filter border border-purple-500/20 rounded-lg p-6 hover:bg-black/40 transition-colors cursor-pointer"
            onClick={() => setShowBestBadge(true)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Best Badge</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center mt-4">
              <div className="bg-blue-900/30 p-3 rounded-lg border border-purple-500/30">
                <Trophy className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-2xl font-bold ml-4">Diamond Holder</span>
            </div>
            <div className="flex items-center mt-2 text-purple-400">
              <span>Earned 2 days ago</span>
            </div>
          </div>

          {/* Earned Badges */}
          <div
            className="bg-black/30 backdrop-blur-md backdrop-filter border border-purple-500/20 rounded-lg p-6 hover:bg-black/40 transition-colors cursor-pointer"
            onClick={() => setShowBadges(true)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Earned Badges</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center mt-4">
              <div className="flex -space-x-3">
                {userBadges.slice(0, 3).map((badge, index) => (
                  <div
                    key={badge.id}
                    className={`bg-purple-900/30 p-2 rounded-full border border-purple-500/30 z-${30 - index * 10}`}
                  >
                    <badge.icon className={`h-6 w-6 ${badge.color}`} />
                  </div>
                ))}
                {userBadges.length > 3 && (
                  <div className="bg-purple-900/30 p-2 rounded-full border border-purple-500/30 flex items-center justify-center z-0 w-10 h-10">
                    <span className="text-sm font-bold">+{userBadges.length - 3}</span>
                  </div>
                )}
              </div>
              <span className="text-xl font-bold ml-4">View All Badges</span>
            </div>
            <div className="flex items-center mt-2 text-purple-400">
              <span>Click to see details</span>
            </div>
          </div>
        </div>

        

        {/* User Rank in Leaderboard */}
        

        {/* Best Badge Modal */}
        {showBestBadge && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm backdrop-filter flex items-center justify-center z-50">
            <div className="bg-black/80 backdrop-blur-md backdrop-filter rounded-lg p-6 max-w-md w-full border border-purple-500/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Best Badge</h3>
                <button
                  onClick={() => setShowBestBadge(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-black/60 rounded-lg p-6 border border-purple-500/20 flex flex-col items-center">
                <div className="p-6 rounded-full bg-blue-900/30 border border-blue-500/30 mb-4">
                  <Trophy className="h-16 w-16 text-blue-400" />
                </div>
                <h4 className="font-bold text-2xl text-center mb-2">Diamond Hodler</h4>
                <p className="text-gray-300 text-center mb-4">Held tokens for over 1 year</p>
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 w-full"></div>
                </div>
                <p className="text-purple-400 text-sm mt-4">
                  Earned on{" "}
                  {new Date("2023-12-15").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Badge Benefits:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="bg-purple-900/30 p-1 rounded-full mr-2 mt-0.5">
                      <Check className="h-3 w-3 text-purple-400" />
                    </div>
                    <span className="text-sm">Access to exclusive Diamond Hodler events</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-900/30 p-1 rounded-full mr-2 mt-0.5">
                      <Check className="h-3 w-3 text-purple-400" />
                    </div>
                    <span className="text-sm">10% bonus on all staking rewards</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-900/30 p-1 rounded-full mr-2 mt-0.5">
                      <Check className="h-3 w-3 text-purple-400" />
                    </div>
                    <span className="text-sm">Priority access to new platform features</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowBestBadge(false)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Badges Modal */}
        {showBadges && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm backdrop-filter flex items-center justify-center z-50">
            <div className="bg-black/80 backdrop-blur-md backdrop-filter rounded-lg p-6 max-w-2xl w-full border border-purple-500/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Your Earned Badges</h3>
                <button
                  onClick={() => setShowBadges(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {userBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-black/60 rounded-lg p-4 border border-purple-500/20 flex items-start hover:bg-black/70 transition-all"
                  >
                    <div
                      className={`p-3 rounded-full ${badge.color.replace("text-", "bg-").replace("400", "bg-purple-900")} mr-3 flex-shrink-0`}
                    >
                      <badge.icon className={`h-6 w-6 ${badge.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{badge.name}</h4>
                      <p className="text-gray-300 text-sm mt-1">{badge.description}</p>
                      <p className="text-purple-400 text-xs mt-2">
                        Earned on{" "}
                        {new Date(badge.earnedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowBadges(false)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Score Card Modal - Redesigned to match Kaito's style with requested changes */}
        {showScoreCard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm backdrop-filter flex items-center justify-center z-50">
            <div className="bg-[#0A0A0F] backdrop-blur-md backdrop-filter rounded-xl p-6 max-w-4xl w-full border border-purple-500/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Your Score Card</h3>
                <button
                  onClick={() => setShowScoreCard(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                ref={scoreCardRef}
                className="bg-gradient-to-b from-[#0A0A0F] to-[#141419] rounded-xl p-6 mb-6 border border-purple-500/20 relative overflow-hidden"
              >
                {/* Header with date */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-lg text-gray-400">
                    {currentUser.lastUpdated} <span className="text-sm">(updated every Sunday)</span>
                  </div>
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left column - User info and stats */}
                  <div className="space-y-6">
                    {/* User profile */}
                    <div className="flex items-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center text-xl font-bold border-2 border-purple-400/30">
                        HK
                      </div>
                      <div className="ml-4">
                        <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                        <div className="flex items-center">
                          <span className="text-gray-400">{currentUser.handle}</span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-blue-400 font-medium">Diamond Holder</span>
                        </div>
                        <div className="mt-1 text-purple-400 font-bold">Rank #{currentUser.rank}</div>
                      </div>
                    </div>

                    {/* Score Summary */}
                    <div className="bg-black/40 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="text-lg font-medium mb-3">Score Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Twitter Score:</span>
                          <span className="text-xl font-bold">{currentUser.twitterScore}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Telegram Score:</span>
                          <span className="text-xl font-bold">{currentUser.telegramScore}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Wallet Score:</span>
                          <span className="text-xl font-bold">{currentUser.walletScore}</span>
                        </div>
                        <div className="h-px w-full bg-purple-600/20 my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Total Score:</span>
                          <span className="text-2xl font-bold text-purple-400">{currentUser.totalScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge Collection */}
                    <div className="bg-black/40 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="text-lg font-medium mb-3">Badge Collection</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Total Badges:</span>
                          <span className="text-xl font-bold">{userBadges.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Latest Badge:</span>
                          <span className="text-xl font-bold text-purple-400">Community Guardian</span>
                        </div>
                        <div className="h-px w-full bg-purple-600/20 my-2"></div>
                        <div className="flex items-center justify-center gap-3">
                          {userBadges.slice(0, 5).map((badge, index) => (
                            <div key={badge.id} className="bg-black/60 p-2 rounded-full border border-purple-500/20">
                              <badge.icon className={`h-6 w-6 ${badge.color}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column - Enhanced Network visualization */}
                  <div className="relative">
                    <canvas
                      ref={networkCanvasRef}
                      className="w-full h-[400px] rounded-xl bg-black/20 border border-purple-500/20"
                    ></canvas>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-gray-400">cluster.protocol</span>
                  </div>
                  <div className="text-gray-400">yaps.cluster.ai</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="bg-black/40 hover:bg-purple-900/40 text-white px-4 py-3 rounded-xl flex items-center justify-center transition-colors border border-purple-500/20 text-lg font-medium"
                  onClick={copyScoreCardLink}
                >
                  <Link className="h-5 w-5 mr-3" />
                  {scoreCardCopyStatus.link === "copied" ? "Link Copied!" : "Copy Link"}
                </button>
                <button
                  className="bg-black/40 hover:bg-purple-900/40 text-white px-4 py-3 rounded-xl flex items-center justify-center transition-colors border border-purple-500/20 text-lg font-medium"
                  onClick={copyScoreCardImage}
                >
                  <Image className="h-5 w-5 mr-3" />
                  {scoreCardCopyStatus.image === "copied"
                    ? "Image Copied!"
                    : scoreCardCopyStatus.image === "processing"
                      ? "Processing..."
                      : "Copy Image"}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20Cluster%20Protocol%20score%20card!%20Total%20Score:%20${currentUser.totalScore}&url=https://cluster.protocol/scorecard/${currentUser.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1DA1F2] hover:bg-[#1a94e0] text-white px-4 py-3 rounded-xl flex items-center justify-center transition-colors text-lg font-medium"
                >
                  <Twitter className="h-5 w-5 mr-3" />
                  Share on Twitter
                </a>
                <button
                  className="bg-black/40 hover:bg-purple-900/40 text-white px-4 py-3 rounded-xl flex items-center justify-center transition-colors border border-purple-500/20 text-lg font-medium"
                  onClick={downloadScoreCard}
                >
                  <Download className="h-5 w-5 mr-3" />
                  Download Card
                </button>
              </div>
            </div>
          </div>
        )}

       

      
      </div>
    </div>
  )
}