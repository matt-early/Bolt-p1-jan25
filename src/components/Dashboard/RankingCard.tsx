import React, { useState } from 'react';
import { Trophy, ChevronRight, X } from 'lucide-react';
import { Rankings, RankingDetails } from '../../types';
import { generateMockSalespeople, generateMockStores } from '../../data/mockData';

interface RankingCardProps {
  rankings: Rankings;
}

interface RankingModalProps {
  title: string;
  data: RankingDetails[];
  currentRank: number;
  onClose: () => void;
}

const RankingModal: React.FC<RankingModalProps> = ({ title, data, currentRank, onClose }) => {
  // Get entries ranked higher than current and the next lower ranked entry
  const relevantEntries = data
    .filter(item => item.rank < currentRank || item.rank === currentRank + 1)
    .sort((a, b) => a.rank - b.rank);

  // Add current user/store to the list
  const currentEntry: RankingDetails = {
    id: 'current',
    name: 'You',
    rank: currentRank,
    attachmentRate: Math.floor(Math.random() * (200 - 100) + 100),
    avgSalesPerUnit: Math.floor(Math.random() * (80 - 30) + 30)
  };

  const allEntries = [...relevantEntries, currentEntry]
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attachment Rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Sales/Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allEntries.map((item) => {
                const isCurrentOrNext = item.rank === currentRank || item.rank === currentRank + 1;
                return (
                  <tr 
                    key={item.id} 
                    className={`
                      ${isCurrentOrNext ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${item.id === 'current' ? 'font-bold' : ''}
                    `}
                  >
                    <td className="px-4 py-2 text-sm">#{item.rank}</td>
                    <td className="px-4 py-2 text-sm">
                      {item.id === 'current' ? 'You' : item.name}
                      {item.rank === currentRank + 1 && (
                        <span className="ml-2 text-xs text-gray-500">(Next Position)</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">{item.attachmentRate}%</td>
                    <td className="px-4 py-2 text-sm">${item.avgSalesPerUnit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const RankingCard: React.FC<RankingCardProps> = ({ rankings }) => {
  const [showStorePeople, setShowStorePeople] = useState(false);
  const [showStores, setShowStores] = useState(false);

  const mockSalespeople = generateMockSalespeople();
  const mockStores = generateMockStores();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex items-center mb-4">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-semibold">Your Rankings</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowStorePeople(true)}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Store Ranking</p>
                <p className="text-2xl font-bold mt-1">#{rankings.storeRank}</p>
                <p className="text-sm text-gray-500 mt-1">of {rankings.totalParticipants}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </div>
          </button>
          <button
            onClick={() => setShowStores(true)}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Region Ranking</p>
                <p className="text-2xl font-bold mt-1">#{rankings.regionRank}</p>
                <p className="text-sm text-gray-500 mt-1">of {rankings.totalParticipants}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </div>
          </button>
        </div>
      </div>

      {showStorePeople && (
        <RankingModal
          title="Store Rankings - Higher Performing Salespeople"
          data={mockSalespeople}
          currentRank={rankings.storeRank}
          onClose={() => setShowStorePeople(false)}
        />
      )}

      {showStores && (
        <RankingModal
          title="Region Rankings - Higher Performing Stores"
          data={mockStores}
          currentRank={rankings.regionRank}
          onClose={() => setShowStores(false)}
        />
      )}
    </>
  );
};