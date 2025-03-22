"use client"

import { useState } from "react"
import { Copy, Check, Users, X, Twitter, Send, MessageCircle, Mail, Sparkles, Gift } from "lucide-react"

export default function ReferFriend() {
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [copyStatus, setCopyStatus] = useState("")
  const referralLink = "https://cluster.protocol/ref/BRUTALG21614093"

  // Copy the referral link to clipboard
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopyStatus("copied")
    setTimeout(() => setCopyStatus(""), 2000)
  }

  return (
    <div className="relative">
      {/* Refer Button with Glow Effect */}
      <button
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg flex items-center gap-2 text-lg font-semibold shadow-md transition-transform transform hover:scale-105 hover:shadow-purple-500/50"
        onClick={() => setShowReferralModal(true)}
      >
        <Users className="h-5 w-5" />
        Refer a Friend
      </button>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#0A0A0F] border border-purple-500/30 shadow-xl rounded-xl p-8 max-w-2xl w-full relative">
            <button onClick={() => setShowReferralModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-white">Refer & Earn Rewards</h3>
              <p className="text-gray-400 mt-2">Invite your friends and earn exciting rewards!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Benefits */}
              <div>
                <div className="bg-black/50 rounded-lg p-6 border border-purple-500/30 shadow-md">
                  <div className="flex items-center justify-center mb-4">
                    <Gift className="h-12 w-12 text-yellow-400" />
                  </div>
                  <h4 className="text-lg font-bold text-center mb-2 text-purple-400">Earn Exclusive Rewards</h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>🎉 50 points per successful referral</li>
                    <li>🎁 Bonus 100 points when they connect their wallet</li>
                    <li>🏅 Unlock the "Network Builder" badge after 5 referrals</li>
                  </ul>
                </div>

                {/* Referral Stats */}
                <div className="mt-6 bg-black/50 rounded-lg p-4 border border-purple-500/30 shadow-md text-center">
                  <h5 className="text-lg font-bold text-purple-300">Your Referral Stats</h5>
                  <div className="flex justify-around mt-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">3</div>
                      <p className="text-gray-400 text-sm">Friends Referred</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">150</div>
                      <p className="text-gray-400 text-sm">Points Earned</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Share Link & Buttons */}
              <div className="flex flex-col">
                <div className="bg-black/50 rounded-lg p-6 border border-purple-500/30 shadow-md">
                  <h4 className="text-lg font-semibold text-white mb-3">Your Referral Link</h4>
                  <div className="flex items-center bg-black/40 rounded-lg border border-purple-500/20 p-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="bg-transparent border-none outline-none flex-1 text-sm text-gray-300"
                    />
                    <button
                      className="ml-2 p-2 rounded-lg bg-purple-900/30 hover:bg-purple-600 transition"
                      onClick={copyReferralLink}
                    >
                      {copyStatus === "copied" ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <Copy className="h-5 w-5 text-purple-400" />
                      )}
                    </button>
                  </div>

                  {/* Social Share Buttons */}
                  <h4 className="text-lg font-semibold text-white mt-4">Share with Friends</h4>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <a
                      href={`https://twitter.com/intent/tweet?text=Join me on Cluster Protocol and boost your crypto social score! Use my referral link: ${referralLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-lg border border-purple-500/20 hover:bg-purple-900/30 transition"
                    >
                      <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                      <span className="text-xs text-gray-400">Twitter</span>
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${referralLink}&text=Join me on Cluster Protocol and boost your crypto social score!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-lg border border-purple-500/20 hover:bg-purple-900/30 transition"
                    >
                      <Send className="h-6 w-6 text-[#0088cc]" />
                      <span className="text-xs text-gray-400">Telegram</span>
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=Join me on Cluster Protocol! Use my referral link: ${referralLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-lg border border-purple-500/20 hover:bg-purple-900/30 transition"
                    >
                      <MessageCircle className="h-6 w-6 text-[#25D366]" />
                      <span className="text-xs text-gray-400">WhatsApp</span>
                    </a>
                    <a
                      href={`mailto:?subject=Join Cluster Protocol&body=Join me on Cluster Protocol! Use my referral link: ${referralLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-lg border border-purple-500/20 hover:bg-purple-900/30 transition"
                    >
                      <Mail className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-400">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowReferralModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
