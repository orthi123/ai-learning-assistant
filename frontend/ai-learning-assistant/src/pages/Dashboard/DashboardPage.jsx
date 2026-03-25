import React, { useState, useEffect } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import { FileText, BookOpen, BrainCircuit, TrendingUp } from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();
        // Backend response onujayi data set koro (data.data ba sudhu data)
        setDashboardData(response?.data || response); 
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Spinner />;

  // Overview data check (Data na thakle default zero dekhabe)
  const overview = dashboardData?.overview || {};

  const stats = [
    {
      label: 'Total Documents',
      value: overview.totalDocuments || 0,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
    },
    {
      label: 'Total Flashcards',
      value: overview.totalFlashcards || 0,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25',
    },
    {
      label: 'Total Quizzes',
      value: overview.totalQuizzes || 0,
      icon: BrainCircuit,
      gradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-emerald-500/25',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-xl ${stat.shadowColor} hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State message jodi asholei kono data na thake */}
      {Object.keys(overview).length === 0 && (
        <div className="mt-10 p-10 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
           <TrendingUp className="mx-auto mb-2 text-slate-300" size={32} />
           <p className="text-slate-500">No activity recorded yet.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;