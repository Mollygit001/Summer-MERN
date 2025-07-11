import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { serverEndpoint } from "../../../config/config";
import { Bar, Pie } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
   Chart as ChartJS,
   BarElement,
   CategoryScale,
   LinearScale,
   ArcElement,
   Tooltip,
   Legend,
   Title
} from 'chart.js';

ChartJS.register(
   BarElement,
   CategoryScale,
   LinearScale,
   ArcElement,
   Tooltip,
   Legend,
   Title
);

const formatDate = (isoDateString) => {
   if (!isoDateString) return '';
   try {
      const date = new Date(isoDateString);
      return new Intl.DateTimeFormat('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      }).format(date);
   } catch (error) {
      console.log(error);
      return '';
   }
};

const AnalyticsDashboard = () => {
   const { linkId } = useParams();
   const navigate = useNavigate();
   const [analyticsData, setAnalyticsData] = useState([]);
   const [fromDate, setFromDate] = useState(null);
   const [toDate, setToDate] = useState(null);

   const fetchLinkAnalytics = async () => {
      try {
         const response = await axios.get(`${serverEndpoint}/links/analytics`, {
            params: {
               linkId: linkId,
               from: fromDate,
               to: toDate
            },
            withCredentials: true
         });
         setAnalyticsData(response.data);
      } catch (error) {
         console.log(error);
         navigate('/error');
      }
   };

   const groupBy = (key) => {
      return analyticsData.reduce((acc, item) => {
         const label = item[key] || 'unknown';
         acc[label] = (acc[label] || 0) + 1;
         return acc;
      }, {});
   };

   const clicksByCity = groupBy('city');
   const clicksByBrowser = groupBy('browser');

   useEffect(() => {
      fetchLinkAnalytics();
   }, [fromDate, toDate]);

   return (
      <div className="max-w-7xl mx-auto py-8 px-4">
         <h1 className="text-2xl font-bold mb-6">Analytics for Link ID: <span className="text-blue-600">{linkId}</span></h1>

         {/* Filters */}
         <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Filters</h2>
            <div className="flex flex-wrap gap-4">
               <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  className="border rounded px-3 py-2"
                  placeholderText="From Date"
               />
               <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  className="border rounded px-3 py-2"
                  placeholderText="To Date"
               />
            </div>
         </div>

         {/* Charts */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white shadow-md p-4 rounded-lg">
               <h3 className="text-lg font-semibold mb-2">Clicks by City</h3>
               <Bar
                  data={{
                     labels: Object.keys(clicksByCity),
                     datasets: [{
                        label: 'Clicks',
                        data: Object.values(clicksByCity),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                     }]
                  }}
                  options={{ responsive: true }}
               />
            </div>

            <div className="bg-white shadow-md p-4 rounded-lg">
               <h3 className="text-lg font-semibold mb-2">Clicks by Browser</h3>
               <Pie
                  data={{
                     labels: Object.keys(clicksByBrowser),
                     datasets: [{
                        data: Object.values(clicksByBrowser),
                        backgroundColor: [
                           '#FF6384',
                           '#36A2EB',
                           '#FFCE56',
                           '#4BC0C0',
                           '#9966FF',
                           '#FF9F40',
                        ]
                     }]
                  }}
                  options={{ responsive: true }}
               />
            </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full text-sm text-left">
               <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                  <tr>
                     <th className="px-4 py-3">IP Address</th>
                     <th className="px-4 py-3">City</th>
                     <th className="px-4 py-3">Country</th>
                     <th className="px-4 py-3">Browser</th>
                     <th className="px-4 py-3">Device</th>
                     <th className="px-4 py-3">ISP</th>
                     <th className="px-4 py-3">Click Date</th>
                  </tr>
               </thead>
               <tbody>
                  {analyticsData.map((item) => (
                     <tr key={item._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{item.ip}</td>
                        <td className="px-4 py-2">{item.city || 'Unknown'}</td>
                        <td className="px-4 py-2">{item.country || 'Unknown'}</td>
                        <td className="px-4 py-2">{item.browser || 'Unknown'}</td>
                        <td className="px-4 py-2">{item.device || 'Unknown'}</td>
                        <td className="px-4 py-2">{item.isp || 'Unknown'}</td>
                        <td className="px-4 py-2">{formatDate(item.clickedAt)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}

export default AnalyticsDashboard;
