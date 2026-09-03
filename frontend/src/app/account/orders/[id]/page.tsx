
export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order #{params.id}</h1>
      <div className="bg-gray-50 border rounded-lg p-6 mb-6">
        <p className="text-gray-500">Order details will appear here.</p>
      </div>
    </div>
  );
}
