import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom";
import { DetailsSection } from "../src/app/components/DetailsSection/detailsSection";
import { getCmdLineJsonMock, getFlagsResponseJsonMock } from "./mocks";
import { flagsFromJson } from "../src/helpers/flagsFromJson";

describe("Details section", () => {
	beforeEach(() => {
		let flags = flagsFromJson(getFlagsResponseJsonMock);
		render(<DetailsSection flags={flags} />);
	});

	it("check is renders content section", () => {
		let content_section = screen.getByTestId("test_details_section_content");
		expect(content_section).toBeInTheDocument();
	});

	it("check is renders flags", () => {
		let flagsButton = screen.getByTestId("flags_button");
		expect(flagsButton).toBeInTheDocument();
		fireEvent.click(flagsButton);
		let table = screen.getByTestId("details_section_flags_table");
		expect(table).toBeInTheDocument();
	});

	it("check is renders command line arguments", () => {
		let content_section = screen.getByTestId("test_details_section_content");
		let commandButton = screen.getByTestId("command_button");
		expect(commandButton).toBeInTheDocument();
		fireEvent.click(commandButton);
		expect(content_section.children.length).equals(1);
	});

	it("check is renders node info", () => {
		// TODO: implement after get data
		let content_section = screen.getByTestId("test_details_section_content");
		let nodeInfoButton = screen.getByTestId("node_info_button");
		expect(nodeInfoButton).toBeInTheDocument();
		fireEvent.click(nodeInfoButton);
		expect(content_section.children.length).equals(0);
	});
});
