"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Download } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateTransactionsPDF } from "@/lib/pdfHelpers";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

const monthOptions = [
  { label: "All Months", value: "ALL" },
  { label: "January", value: "0" },
  { label: "February", value: "1" },
  { label: "March", value: "2" },
  { label: "April", value: "3" },
  { label: "May", value: "4" },
  { label: "June", value: "5" },
  { label: "July", value: "6" },
  { label: "August", value: "7" },
  { label: "September", value: "8" },
  { label: "October", value: "9" },
  { label: "November", value: "10" },
  { label: "December", value: "11" },
];

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  // Filter transactions for selected account
  let accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  // Filter by selected month if not "ALL"
  if (selectedMonth !== "ALL") {
    accountTransactions = accountTransactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth().toString() === selectedMonth;
    });
  }

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate expense breakdown for current month
  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const date = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      (selectedMonth === "ALL" ||
        date.getMonth().toString() === selectedMonth) &&
      date.getFullYear() === currentDate.getFullYear()
    );
  });

  // Group expenses by category
  const expensesByCategory = currentMonthExpenses.reduce((acc, t) => {
    const category = t.category;
    if (!acc[category]) acc[category] = 0;
    acc[category] += t.amount;
    return acc;
  }, {});

  // Format data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const handleDownloadPDF = () => {
    if (accountTransactions.length === 0) {
      alert("No transactions available for this account and month.");
      return;
    }
    const accountName =
      accounts.find((a) => a.id === selectedAccountId)?.name ||
      "Unknown Account";
    const monthLabel =
      monthOptions.find((m) => m.value === selectedMonth)?.label ||
      "All Months";

    generateTransactionsPDF(accountTransactions, accountName, monthLabel);
  };

  return (
    <div className="grid gap-4">
      {/* Grid for two main cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions Card */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 pb-4">
            <CardTitle className="text-base font-normal">
              Recent Transactions
            </CardTitle>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="flex gap-1"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No recent transactions
                </p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description || "Untitled Transaction"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center",
                          transaction.type === "EXPENSE"
                            ? "text-red-500"
                            : "text-green-500"
                        )}
                      >
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                        )}
                        ₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal">
              Monthly Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-5">
            {pieChartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No expenses for selected month
              </p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) =>
                        `${name}: ₹${value.toFixed(2)}`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
