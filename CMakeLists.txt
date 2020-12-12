cmake_minimum_required(VERSION 3.4)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} ${CMAKE_CURRENT_SOURCE_DIR}/juce-cmake/cmake)
set_property(GLOBAL PROPERTY USE_FOLDERS YES)
set(CMAKE_BUILD_TYPE Release)
set(CMAKE_CXX_FLAGS "-DNDEBUG /EHsc")
set(JUCE_DIR JUCE)

macro(add_project path)
	string(MAKE_C_IDENTIFIER ${path} JUCE_CURRENT_TARGET_PREFIX)
	add_subdirectory("${path}" "${PROJECT_BINARY_DIR}/${path}")
endmacro()

add_compile_definitions(JUCE_PLUGINHOST_VST3=1)

project("EIMVstHost")

find_package(JUCE REQUIRED 
	COMPONENTS 
		juce_core
		juce_data_structures
		juce_events
		juce_audio_processors
		juce_audio_utils
		juce_audio_devices
)

include_directories(${CMAKE_JS_INC})
add_definitions(-DNAPI_VERSION=3)
file(GLOB SOURCE_FILES "vsthost/main.cpp")
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

target_include_directories(${PROJECT_NAME} PRIVATE "${CMAKE_SOURCE_DIR}/node_modules/node-addon-api")
target_include_directories(${PROJECT_NAME} PRIVATE "${CMAKE_SOURCE_DIR}/node")
target_link_libraries(${PROJECT_NAME} PRIVATE ${CMAKE_JS_LIB})
target_link_libraries(${PROJECT_NAME} PRIVATE ${JUCE_LIBRARIES})
target_include_directories(${PROJECT_NAME} PRIVATE vst3sdk)
