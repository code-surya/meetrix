import { Container } from '@/components/layout/Container';

const EventEditPage = () => {
  return (
    <Container>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-gray-600 mt-2">Update your event details and settings</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Event Edit Form</h3>
                <p className="text-sm">
                  This is a placeholder for the event editing form. In a full implementation, this would allow organizers to:
                </p>
                <ul className="text-sm text-left max-w-md mx-auto mt-4 space-y-1">
                  <li>• Modify event details and description</li>
                  <li>• Update date, time, and location</li>
                  <li>• Adjust ticket prices and quantities</li>
                  <li>• Upload new event images</li>
                  <li>• Change event status (publish/draft)</li>
                  <li>• Manage event settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default EventEditPage;

