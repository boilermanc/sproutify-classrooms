import { useParams, useSearchParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAppStore, newPlant, newHarvest, newPest } from "@/context/AppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TowerPhotosTab from "./TowerPhotosTab";
import { ColorNumberInput } from "@/components/ui/color-number-input";
import { SEO } from "@/components/SEO";

export default function TowerDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppStore();
  const tower = useMemo(() => state.towers.find((t) => t.id === id), [state.towers, id]);

  const [ph, setPh] = useState<number | undefined>(tower?.vitals.ph);
  const [ec, setEc] = useState<number | undefined>(tower?.vitals.ec);
  const [light, setLight] = useState<number | undefined>(tower?.vitals.lightHours);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "vitals";

  if (!tower) return <div>Not found</div>;
  return (
    <>
      <SEO 
        title={`${tower.name} - Tower Details`}
        description={`Monitor vitals, plants, and harvests for ${tower.name}. Track pH, EC, lighting, and manage your hydroponic tower garden.`}
      />
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{tower.name}</h1>
        <div className="text-sm text-muted-foreground">{tower.ports} ports</div>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="plants">Plants</TabsTrigger>
          <TabsTrigger value="pests">Pests</TabsTrigger>
          <TabsTrigger value="harvests">Harvests</TabsTrigger>
          <TabsTrigger value="waste">Waste</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="mt-4">
          <Card>
            <CardHeader><CardTitle>pH / EC / Lighting</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <ColorNumberInput
                type="ph"
                label="pH"
                value={ph}
                onChange={setPh}
                placeholder="e.g. 6.5"
              />
              <ColorNumberInput
                type="ec"
                label="EC (mS/cm)"
                value={ec}
                onChange={setEc}
                placeholder="e.g. 1.6"
              />
              <div className="space-y-2">
                <Label>Light hours/day</Label>
                <Input inputMode="numeric" value={light ?? ""} onChange={(e)=>setLight(Number(e.target.value))} placeholder="e.g. 12" />
              </div>
              <div className="md:col-span-3">
                <Button onClick={()=>dispatch({ type: "UPDATE_VITALS", payload: { id: tower.id, ph, ec, lightHours: light } })}>
                  Save vitals
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plants" className="mt-4">
          <PlantsTab towerId={tower.id} />
        </TabsContent>

        <TabsContent value="pests" className="mt-4">
          <PestsTab towerId={tower.id} />
        </TabsContent>

        <TabsContent value="harvests" className="mt-4">
          <HarvestsTab towerId={tower.id} />
        </TabsContent>

        <TabsContent value="waste" className="mt-4">
          <WasteTab towerId={tower.id} />
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          <TowerPhotosTab towerId={tower.id} />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}

function PlantsTab({ towerId }: { towerId: string }) {
  const { state, dispatch } = useAppStore();
  const [plant, setPlant] = useState(() => newPlant());
  const tower = state.towers.find((t) => t.id === towerId)!;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Plant</CardTitle>
            <Button asChild variant="link" size="sm">
              <Link to={`/app/catalog?addTo=${towerId}`}>Add from catalog</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={plant.name} onChange={(e)=>setPlant({ ...plant, name: e.target.value })} placeholder="Lettuce" />
          </div>
          <div className="space-y-2">
            <Label>Seeded at</Label>
            <Input type="date" value={plant.seededAt ?? ""} onChange={(e)=>setPlant({ ...plant, seededAt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Planted at</Label>
            <Input type="date" value={plant.plantedAt ?? ""} onChange={(e)=>setPlant({ ...plant, plantedAt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input inputMode="numeric" value={plant.quantity ?? 1} onChange={(e)=>setPlant({ ...plant, quantity: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Growth rate (cm/week)</Label>
            <Input inputMode="decimal" value={plant.growthRate ?? ""} onChange={(e)=>setPlant({ ...plant, growthRate: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Harvest date</Label>
            <Input type="date" value={plant.harvestDate ?? ""} onChange={(e)=>setPlant({ ...plant, harvestDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Harvest weight (g)</Label>
            <Input inputMode="decimal" value={plant.harvestWeightGrams ?? ""} onChange={(e)=>setPlant({ ...plant, harvestWeightGrams: Number(e.target.value) })} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Outcome</Label>
            <Input value={plant.outcome ?? ""} onChange={(e)=>setPlant({ ...plant, outcome: e.target.value })} placeholder="Eaten in class, donated, etc" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={()=>{ dispatch({ type: "ADD_PLANT", payload: { towerId, plant } }); setPlant(newPlant()); }}>Add plant</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Plants</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tower.plants.length === 0 && <div className="text-sm text-muted-foreground">No plants yet.</div>}
            {tower.plants.map((p)=> (
              <div key={p.id} className="grid md:grid-cols-7 gap-2 p-3 border rounded-md">
                <div><span className="text-xs text-muted-foreground">Name</span><div>{p.name}</div></div>
                <div><span className="text-xs text-muted-foreground">Seeded</span><div>{p.seededAt ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Planted</span><div>{p.plantedAt ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Qty</span><div>{p.quantity ?? 1}</div></div>
                <div><span className="text-xs text-muted-foreground">Harvest</span><div>{p.harvestDate ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Weight</span><div>{p.harvestWeightGrams ?? "-"} g</div></div>
                <div><span className="text-xs text-muted-foreground">Outcome</span><div>{p.outcome ?? "-"}</div></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PestsTab({ towerId }: { towerId: string }) {
  const { state, dispatch } = useAppStore();
  const [issue, setIssue] = useState("");
  const [action, setAction] = useState("");
  const tower = state.towers.find((t) => t.id === towerId)!;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Log pest/scouting</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Observation</Label>
            <Textarea value={issue} onChange={(e)=>setIssue(e.target.value)} placeholder="Aphids on row 2" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Action</Label>
            <Textarea value={action} onChange={(e)=>setAction(e.target.value)} placeholder="Released ladybugs" />
          </div>
          <div className="md:col-span-2">
            <Button onClick={()=>{ dispatch({ type: "ADD_PEST", payload: { towerId, entry: newPest({ issue, action }) } }); setIssue(""); setAction(""); }}>Save entry</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {tower.pests.length === 0 && <div className="text-sm text-muted-foreground">No entries yet.</div>}
          {tower.pests.map((p)=> (
            <div key={p.id} className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">{new Date(p.date).toLocaleString()}</div>
              <div className="font-medium">{p.issue}</div>
              {p.action && <div className="text-sm">Action: {p.action}</div>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HarvestsTab({ towerId }: { towerId: string }) {
  const { state, dispatch } = useAppStore();
  const tower = state.towers.find((t) => t.id === towerId)!;
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [weight, setWeight] = useState<number>(0);
  const [dest, setDest] = useState<string>("");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Harvest</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Weight (g)</Label>
            <Input inputMode="decimal" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Destination</Label>
            <Input value={dest} onChange={(e)=>setDest(e.target.value)} placeholder="Cafeteria, donation, etc" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={()=>{ dispatch({ type: "ADD_HARVEST", payload: { towerId, harvest: newHarvest({ date, weightGrams: weight, destination: dest }) } }); setDest(""); setWeight(0); }}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Harvests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {tower.harvests.length === 0 && <div className="text-sm text-muted-foreground">No harvests yet.</div>}
          {tower.harvests.map((h)=> (
            <div key={h.id} className="grid md:grid-cols-3 gap-2 p-3 border rounded-md">
              <div><span className="text-xs text-muted-foreground">Date</span><div>{h.date}</div></div>
              <div><span className="text-xs text-muted-foreground">Weight</span><div>{h.weightGrams} g</div></div>
              <div><span className="text-xs text-muted-foreground">Destination</span><div>{h.destination}</div></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function WasteTab({ towerId }: { towerId: string }) {
  const { state, dispatch } = useAppStore();
  const tower = state.towers.find((t) => t.id === towerId)!;
  const [waste, setWaste] = useState<number>(tower.wasteGrams ?? 0);

  return (
    <Card>
      <CardHeader><CardTitle>Track Waste</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Waste (g)</Label>
          <Input inputMode="decimal" value={waste} onChange={(e)=>setWaste(Number(e.target.value))} />
        </div>
        <div className="md:col-span-3">
          <Button onClick={()=>dispatch({ type: "SET_WASTE", payload: { towerId, grams: waste } })}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
