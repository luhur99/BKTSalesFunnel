import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Mail, Phone, Building2, Calendar, TrendingUp, Filter, ArrowUpDown } from "lucide-react";
import { Lead, Stage, FunnelType } from "@/types/lead";
import { db } from "@/lib/supabase";

interface LeadListViewProps {
  onLeadClick: (lead: Lead) => void;
  refreshTrigger?: number;
}

export function LeadListView({ onLeadClick, refreshTrigger = 0 }: LeadListViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFunnel, setFilterFunnel] = useState<"all" | FunnelType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "deal" | "lost">("active");
  const [sortField, setSortField] = useState<"created_at" | "updated_at" | "name">("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, stagesData] = await Promise.all([
        db.leads.getAll(),
        db.stages.getAll()
      ]);
      setLeads(leadsData);
      setStages(stagesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (leadId: string, newStageId: string) => {
    try {
      const newStage = stages.find(s => s.id === newStageId);
      if (!newStage) return;

      await db.leads.moveToStage(
        leadId,
        newStageId,
        "Manual stage change from list view",
        "Changed via dropdown",
        "Sales User"
      );
      
      await loadData();
    } catch (error) {
      console.error("Error changing stage:", error);
    }
  };

  const filteredLeads = leads
    .filter(lead => {
      // Status filter
      if (filterStatus !== "all" && lead.status !== filterStatus) return false;
      
      // Funnel filter
      if (filterFunnel !== "all" && lead.current_funnel !== filterFunnel) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === "name") {
        aVal = a.name || "";
        bVal = b.name || "";
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      active: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Aktif" },
      deal: { color: "bg-green-100 text-green-700 border-green-200", label: "Deal" },
      lost: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Lost" }
    };
    const variant = variants[status] || variants.active;
    return (
      <Badge className={`${variant.color} border`}>
        {variant.label}
      </Badge>
    );
  };

  const getFunnelBadge = (funnel: FunnelType) => {
    return funnel === "follow_up" ? (
      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 border">
        Follow Up
      </Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">
        Broadcast
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari nama, email, phone, atau company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterFunnel} onValueChange={(v: any) => setFilterFunnel(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Funnel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Funnel</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
            <SelectItem value="broadcast">Broadcast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="deal">Deal</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Menampilkan <strong>{filteredLeads.length}</strong> dari {leads.length} leads
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Lead Info</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold">Funnel</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  Tidak ada leads ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onLeadClick(lead)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">
                        {lead.name || <span className="text-slate-400 italic">Tanpa Nama</span>}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Building2 className="w-3 h-3" />
                          {lead.company}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700">
                      {lead.source?.name || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getFunnelBadge(lead.current_funnel)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={lead.current_stage_id}
                      onValueChange={(newStageId) => handleStageChange(lead.id, newStageId)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
                          Follow Up
                        </div>
                        {stages
                          .filter(s => s.funnel_type === "follow_up")
                          .map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.stage_number}. {stage.stage_name}
                            </SelectItem>
                          ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase border-t mt-1">
                          Broadcast
                        </div>
                        {stages
                          .filter(s => s.funnel_type === "broadcast")
                          .map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.stage_number}. {stage.stage_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lead.updated_at)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}