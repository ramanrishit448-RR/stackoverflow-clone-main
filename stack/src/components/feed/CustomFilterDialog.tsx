import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface CustomFilterDialogProps {
  children: React.ReactNode;
}

export default function CustomFilterDialog({
  children,
}: CustomFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("My filter");
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("activeCustomFilter");
    if (stored) {
      const parsed = JSON.parse(stored);
      setName(parsed.name || "My filter");
      setSearch(parsed.search || "");
      setTags((parsed.tags || []).join(", "));
    }
  }, [open]);

  const handleSave = () => {
    const filter = {
      name: name.trim() || "My filter",
      search: search.trim(),
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    localStorage.setItem("activeCustomFilter", JSON.stringify(filter));
    window.dispatchEvent(new Event("customFilterChanged"));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-white text-gray-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create custom filter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="filter-name">Filter name</Label>
            <Input
              id="filter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React help"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-term">Search keyword</Label>
            <Input
              id="search-term"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a keyword"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="required-tags">Required tags</Label>
            <Input
              id="required-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, nextjs, mongodb"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            Save filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
