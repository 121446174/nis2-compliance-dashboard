import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
} from "@mui/material";

function AdminBenchmarkPanel() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Global benchmark settings: internal & external weights
  const [benchmarkSettings, setBenchmarkSettings] = useState({
    internal_weight: "",
    external_weight: "",
  });

  // List of sector benchmarks
  const [sectorBenchmarks, setSectorBenchmarks] = useState([]);

  // Editing state for a sector's external benchmark
  const [editingSectorId, setEditingSectorId] = useState(null);
  const [editedExternalScore, setEditedExternalScore] = useState("");
  const [editedSourceReference, setEditedSourceReference] = useState("");
  const [editedJustification, setEditedJustification] = useState("");

  // Fetch benchmark settings
  const fetchBenchmarkSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/admin/benchmark/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch benchmark settings");
      const data = await res.json();
      setBenchmarkSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sector benchmarks list
  const fetchSectorBenchmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/admin/benchmark/sectors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sector benchmarks");
      const data = await res.json();
      setSectorBenchmarks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarkSettings();
    fetchSectorBenchmarks();
  }, []);

  // Update benchmark settings
  const handleSettingsUpdate = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:5000/admin/benchmark/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(benchmarkSettings),
      });
      fetchBenchmarkSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // When a user clicks Edit, populate the edit form
  const handleEditExternal = (sector) => {
    setEditingSectorId(sector.sector_id);
    setEditedExternalScore(sector.external_score);
    setEditedSourceReference(sector.source_reference || "");
    setEditedJustification(sector.justification || "");
  };

  // Save the updated external benchmark values
  const handleSaveExternal = async (sectorId) => {
    try {
      setLoading(true);
      await fetch(`http://localhost:5000/admin/benchmark/external/${sectorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          external_score: editedExternalScore,
          source_reference: editedSourceReference,
          justification: editedJustification,
        }),
      });
      setEditingSectorId(null);
      fetchSectorBenchmarks(); // Refresh the data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
        Benchmark Settings Admin Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Global Benchmark Settings */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Global Benchmark Settings
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Internal Weight (%)"
            type="number"
            value={benchmarkSettings.internal_weight}
            onChange={(e) =>
              setBenchmarkSettings({
                ...benchmarkSettings,
                internal_weight: e.target.value,
              })
            }
          />
          <TextField
            label="External Weight (%)"
            type="number"
            value={benchmarkSettings.external_weight}
            onChange={(e) =>
              setBenchmarkSettings({
                ...benchmarkSettings,
                external_weight: e.target.value,
              })
            }
          />
          <Button variant="contained" onClick={handleSettingsUpdate}>
            Update Settings
          </Button>
        </Box>
      </Paper>

      {/* Edit External Benchmark Form (shown when editing) */}
      {editingSectorId && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Edit External Benchmark
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="External Score"
              type="number"
              value={editedExternalScore}
              onChange={(e) => setEditedExternalScore(e.target.value)}
            />
            <TextField
              label="Source Reference"
              value={editedSourceReference}
              onChange={(e) => setEditedSourceReference(e.target.value)}
            />
            <TextField
              label="Justification"
              multiline
              minRows={2}
              value={editedJustification}
              onChange={(e) => setEditedJustification(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleSaveExternal(editingSectorId)}
              >
                Save
              </Button>
              <Button variant="outlined" onClick={() => setEditingSectorId(null)}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Sector Benchmarks Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sector Benchmarks
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Sector</strong>
              </TableCell>
              <TableCell>
                <strong>Internal Avg</strong>
              </TableCell>
              <TableCell>
                <strong>External Score</strong>
              </TableCell>
              <TableCell>
                <strong>Source Reference</strong>
              </TableCell>
              <TableCell>
                <strong>Justification</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectorBenchmarks.map((sector) => (
              <TableRow key={sector.sector_id}>
                <TableCell>{sector.Sector_Name}</TableCell>
                <TableCell>{Number(sector.internal_avg).toFixed(2)}</TableCell>
                <TableCell>
                  {sector.external_score !== undefined
                    ? sector.external_score
                    : "N/A"}
                </TableCell>
                <TableCell>{sector.source_reference || "N/A"}</TableCell>
                <TableCell sx={{ minWidth: 250 }}>
                  <Typography variant="body2" sx={{ whiteSpace: "normal" }}>
                    {sector.justification || "No justification provided"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditExternal(sector)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default AdminBenchmarkPanel;



