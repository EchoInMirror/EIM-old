#define JUCE_GLOBAL_MODULE_SETTINGS_INCLUDED 1
#define JUCE_PLUGINHOST_VST3 1
#define NAPI_DISABLE_CPP_EXCEPTIONS

#include <napi.h>
#include "JuceHeader.h"

using namespace std;
using namespace Napi;

void ff() {
	juce::initialiseJuce_GUI();
	juce::MessageManager::getInstance()->setCurrentThreadAsMessageThread();
	juce::MessageManager::getInstance()->runDispatchLoop();
}

auto graph = new juce::AudioProcessorGraph();

void create(string path) {
	cout << juce::MessageManager::getInstance()->existsAndIsLockedByCurrentThread() << endl;
	auto list = new juce::KnownPluginList();
	auto manager = new juce::AudioPluginFormatManager();
	manager->addDefaultFormats();
	auto format = manager->getFormat(0);
	auto arr = new juce::OwnedArray<juce::PluginDescription>();
	list->scanAndAddFile(path, false, *arr, *format);

	auto plugin = arr->getFirst();
	juce::String err;
	auto instance = manager->createPluginInstance(*plugin, 44100, 1024, err);
	instance->enableAllBuses();
	instance->setPlayConfigDetails(2, 2, 44100, 1024);
	instance->prepareToPlay(44100, 1024);
	juce::AudioPlayHead::CurrentPositionInfo();
	instance->getPlayHead();
	auto window = new juce::DocumentWindow("test", juce::Colours::lightgrey, juce::DocumentWindow::allButtons);
	window->setContentOwned(instance->createEditorIfNeeded(), true);

	auto graphPlayer = new juce::AudioProcessorPlayer();
	graph->setPlayConfigDetails(2, 2, 44100, 1024);

	graph->setProcessingPrecision(juce::AudioProcessor::singlePrecision);

	graph->prepareToPlay(44100, 1024);

	// auto input = std::make_unique<juce::AudioProcessorGraph::AudioGraphIOProcessor>(juce::AudioProcessorGraph::AudioGraphIOProcessor::audioInputNode);
	auto output = std::make_unique<juce::AudioProcessorGraph::AudioGraphIOProcessor>(juce::AudioProcessorGraph::AudioGraphIOProcessor::audioOutputNode);


	juce::AudioDeviceManager deviceManager;
	juce::AudioDeviceManager::AudioDeviceSetup setup;
	deviceManager.getAudioDeviceSetup(setup);
	deviceManager.initialiseWithDefaultDevices(2, 2);

	deviceManager.addAudioCallback(graphPlayer);
	graphPlayer->setProcessor(graph);

	// auto inputNodePtr = graph->addNode(std::move(input));
	auto pluginNodePtr = graph->addNode(std::move(instance));
	auto outputNodePtr  = graph->addNode(std::move(output));

	// graph->addConnection({ { inputNodePtr->nodeID, 0 }, { pluginNodePtr->nodeID, 0 } });
	// graph->addConnection({ { inputNodePtr->nodeID, 1 }, { pluginNodePtr->nodeID, 1 } });

	graph->addConnection({ { pluginNodePtr->nodeID, 0 }, { outputNodePtr->nodeID, 0 } });
	graph->addConnection({ { pluginNodePtr->nodeID, 1 }, { outputNodePtr->nodeID, 1 } });

	window->setVisible(true);
	juce::MessageManager::getInstance()->runDispatchLoop();
}

Value Fn(const CallbackInfo& info) {
	std::string path = info[0].As<String>();
	juce::MessageManager::getInstance()->callAsync([path]() { create(path); });
	return info.Env().Undefined();
}

Value Fn2(const CallbackInfo& info) {
	juce::MessageManager::getInstance()->callAsync([]() {
		auto audio = new juce::AudioBuffer<double>(2, 1024);
		auto midi = new juce::MidiBuffer();
		midi->addEvent(juce::MidiMessage::noteOn(1, 80, (juce::uint8) 120), 1);
		// midi->addEvent(juce::MidiMessage::noteOff(1, 80, (juce::uint8) 120), 1);
		graph->getNode(0)->getProcessor()->processBlock(*audio, *midi);
	});
	return info.Env().Undefined();
}

Object Init(Env env, Object exports) {
	thread t(ff);
	t.detach();
	exports.Set(String::New(env, "fn"), Function::New<Fn>(env));
	exports.Set(String::New(env, "fn2"), Function::New<Fn2>(env));
	return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
