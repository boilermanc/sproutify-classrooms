import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore, TowerPortConfig } from "@/context/AppStore";

export default function NewTower() {
  const navigate = useNavigate();
  const { dispatch } = useAppStore();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement & { name: { value: string }; ports: { value: string } };
    const name = form.name.value.trim();
    const ports = Number(form.ports.value) as TowerPortConfig;
    if (!name || !ports) return;
    dispatch({ type: "ADD_TOWER", payload: { name, ports } });
    navigate("/app/towers");
  }

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>New Tower</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tower name</Label>
              <Input id="name" name="name" placeholder="e.g. Room 204 Tower A" required />
            </div>
            <div className="space-y-2">
              <Label>Port configuration</Label>
              <Select name="ports" defaultValue="20">
                <SelectTrigger id="ports"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 ports</SelectItem>
                  <SelectItem value="28">28 ports</SelectItem>
                  <SelectItem value="32">32 ports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Create Tower</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
